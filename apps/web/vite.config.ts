import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';

// Dev-only stand-in for apps/api (PHP). Same routes, JSON shape and error codes; users live in memory.
// Accounts are kept in a git-ignored file so they survive dev-server restarts (editing this config restarts it)
const DEV_DB = path.resolve(__dirname, '.dev-auth.json');

function devAuthMock(): Plugin {
  type DevUser = { id: number; name: string; hash: string; salt: string };
  const users = new Map<string, DevUser>(); // keyed by lower-case username, like the case-insensitive MySQL column
  const tokens = new Map<string, string>(); // token -> lower-case username
  let nextId = 1;

  try {
    if (existsSync(DEV_DB)) {
      const saved = JSON.parse(readFileSync(DEV_DB, 'utf8'));
      for (const u of saved.users ?? []) {
        users.set(u.name.toLowerCase(), u);
        nextId = Math.max(nextId, u.id + 1);
      }
      for (const [t, name] of saved.tokens ?? []) tokens.set(t, name);
    }
  } catch {
    // a corrupt dev database is simply ignored
  }
  const persist = () => {
    try {
      writeFileSync(DEV_DB, JSON.stringify({ users: [...users.values()], tokens: [...tokens] }));
    } catch {
      // read-only checkout: accounts then last until the server restarts
    }
  };

  const hash = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString('hex');
  const send = (res: any, status: number, payload: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };
  const fail = (res: any, status: number, error: string) => send(res, status, { ok: false, error });
  const publicUser = (key: string) => ({ id: users.get(key)!.id, username: users.get(key)!.name, elo: 1200 });
  const readBody = (req: any): Promise<any> =>
    new Promise((resolve) => {
      let raw = '';
      req.on('data', (c: Buffer) => (raw += c));
      req.on('end', () => {
        try {
          resolve(JSON.parse(raw || '{}'));
        } catch {
          resolve(null);
        }
      });
    });
  const bearer = (req: any): string | null => {
    const m = /^Bearer\s+([a-f0-9]{64})$/i.exec(req.headers.authorization ?? '');
    return m ? m[1].toLowerCase() : null;
  };
  const issue = (name: string) => {
    const t = randomBytes(32).toString('hex');
    tokens.set(t, name);
    persist();
    return t;
  };

  return {
    name: 'dev-auth-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/auth', async (req, res) => {
        const route = (req.url ?? '').split('?')[0].replace(/^\//, '');

        if (route === 'me.php' && req.method === 'GET') {
          const name = tokens.get(bearer(req) ?? '');
          return name ? send(res, 200, { ok: true, data: { user: publicUser(name) } }) : fail(res, 401, 'UNAUTHORIZED');
        }

        if (req.method !== 'POST') return fail(res, 405, 'METHOD_NOT_ALLOWED');
        const body = await readBody(req);

        if (route === 'logout.php') {
          tokens.delete(bearer(req) ?? '');
          persist();
          return send(res, 200, { ok: true, data: {} });
        }

        if (route === 'register.php') {
          const { username, password } = body ?? {};
          if (
            typeof username !== 'string' || typeof password !== 'string' ||
            !/^[A-Za-z0-9_]{3,20}$/.test(username) || password.length < 8 || password.length > 72
          ) {
            return fail(res, 400, 'VALIDATION');
          }
          const key = username.toLowerCase();
          if (users.has(key)) return fail(res, 409, 'USERNAME_TAKEN');
          const salt = randomBytes(16).toString('hex');
          users.set(key, { id: nextId++, name: username, salt, hash: hash(password, salt) });
          return send(res, 201, { ok: true, data: { token: issue(key), user: publicUser(key) } });
        }

        if (route === 'login.php') {
          const { username, password } = body ?? {};
          const key = typeof username === 'string' ? username.toLowerCase() : '';
          const u = users.get(key);
          const ok =
            u && typeof password === 'string' &&
            timingSafeEqual(Buffer.from(hash(password, u.salt)), Buffer.from(u.hash));
          if (!ok) return fail(res, 401, 'INVALID_CREDENTIALS');
          return send(res, 200, { ok: true, data: { token: issue(key), user: publicUser(key) } });
        }

        return fail(res, 404, 'NOT_FOUND');
      });
    },
  };
}

// Ship the PHP API inside dist/ so uploading dist/ deploys the whole site (schema and example config stay out of the web root)
function copyApi(): Plugin {
  const apiDir = path.resolve(__dirname, '../api');
  const skip = new Set(['schema.sql', 'config.example.php']);
  const walk = (dir: string, rel = ''): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      return statSync(full).isDirectory() ? walk(full, r) : skip.has(r) ? [] : [r];
    });
  return {
    name: 'copy-api',
    apply: 'build',
    generateBundle() {
      for (const file of walk(apiDir)) {
        this.emitFile({ type: 'asset', fileName: `api/${file}`, source: readFileSync(path.join(apiDir, file)) });
      }
    },
  };
}

// AdSense requires /ads.txt; generate it from the publisher id so it can never drift from the build config
function adsTxt(publisherId: string | undefined): Plugin {
  const match = publisherId?.match(/^ca-(pub-\d{10,20})$/);
  return {
    name: 'ads-txt',
    generateBundle() {
      if (!match) return;
      this.emitFile({ type: 'asset', fileName: 'ads.txt', source: `google.com, ${match[1]}, DIRECT, f08c47fec0942fa0\n` });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devAuthMock(), copyApi(), adsTxt(loadEnv(mode, process.cwd(), 'VITE_').VITE_ADSENSE_CLIENT)],
  resolve: {
    alias: {
      '@chess-core': path.resolve(__dirname, '../../packages/chess-core/src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/ai': path.resolve(__dirname, './src/ai'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
}));
