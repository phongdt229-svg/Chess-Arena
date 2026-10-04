import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// Dev-only stand-in for apps/api (PHP). Same routes, JSON shape and error codes; users live in memory.
function devAuthMock(): Plugin {
  const users = new Map<string, { id: number; hash: string; salt: string }>();
  const tokens = new Map<string, string>();
  let nextId = 1;

  const hash = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString('hex');
  const send = (res: any, status: number, payload: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };
  const fail = (res: any, status: number, error: string) => send(res, status, { ok: false, error });
  const publicUser = (name: string) => ({ id: users.get(name)!.id, username: name, elo: 1200 });
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
          if (users.has(username)) return fail(res, 409, 'USERNAME_TAKEN');
          const salt = randomBytes(16).toString('hex');
          users.set(username, { id: nextId++, salt, hash: hash(password, salt) });
          return send(res, 201, { ok: true, data: { token: issue(username), user: publicUser(username) } });
        }

        if (route === 'login.php') {
          const { username, password } = body ?? {};
          const u = typeof username === 'string' ? users.get(username) : undefined;
          const ok =
            u && typeof password === 'string' &&
            timingSafeEqual(Buffer.from(hash(password, u.salt)), Buffer.from(u.hash));
          if (!ok) return fail(res, 401, 'INVALID_CREDENTIALS');
          return send(res, 200, { ok: true, data: { token: issue(username), user: publicUser(username) } });
        }

        return fail(res, 404, 'NOT_FOUND');
      });
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
  plugins: [react(), devAuthMock(), adsTxt(loadEnv(mode, process.cwd(), 'VITE_').VITE_ADSENSE_CLIENT)],
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
