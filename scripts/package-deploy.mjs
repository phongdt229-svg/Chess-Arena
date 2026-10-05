// Builds the site and assembles an upload-ready bundle for shared Apache/PHP hosting:
//   deploy/public_html/       -> upload into the host's public_html (web root)
//   deploy/public_html/api/   -> PHP auth API, same origin as the site
//   deploy/config/config.php  -> upload NEXT TO public_html (outside the web root), then fill in DB details
//   deploy/schema.sql         -> import once into the MySQL database (phpMyAdmin)
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'deploy');
const web = path.join(out, 'public_html');
const api = path.join(root, 'apps', 'api');

execSync('pnpm --filter @chess-arena/web... build', { cwd: root, stdio: 'inherit' });

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, 'config'), { recursive: true });

cpSync(path.join(root, 'apps', 'web', 'dist'), web, { recursive: true });
// Only the runtime PHP goes in the web root; the example config and schema stay out of it
cpSync(api, path.join(web, 'api'), {
  recursive: true,
  filter: (src) => !/config\.example\.php$|schema\.sql$/.test(src),
});
cpSync(path.join(api, 'schema.sql'), path.join(out, 'schema.sql'));
cpSync(path.join(api, 'config.example.php'), path.join(out, 'config', 'config.php'));

writeFileSync(
  path.join(out, 'README.txt'),
  [
    'Chess Arena - deploy bundle for chessapp.online',
    '',
    '1. Upload everything inside public_html/ into the hosting public_html folder.',
    '2. Upload the config/ folder next to public_html (same parent folder, NOT inside it).',
    '3. Create a MySQL database + user in the hosting panel, then edit config/config.php.',
    '4. Import schema.sql into that database with phpMyAdmin.',
    '5. Enable SSL (Let\'s Encrypt / AutoSSL) for chessapp.online, then open https://chessapp.online',
    '',
    'Requires PHP 8.1 or newer with pdo_mysql, and Apache or LiteSpeed with rewrite enabled.',
    'Permissions must be 755 for folders and 644 for files, or LiteSpeed answers 403 for PHP.',
    '',
  ].join('\n'),
);

// Written by hand instead of with tar/zip: Windows tools store every entry as 0777/0666, and
// LiteSpeed/suEXEC hosts answer 403 for PHP scripts that are writable by group or others.
const zip = path.join(root, 'chessapp-deploy.zip');
writeFileSync(zip, makeZip(out));
console.log(`\nDeploy bundle ready:\n  ${out}\n  ${zip}`);

function makeZip(dir) {
  const DIR_MODE = 0o40755;
  const FILE_MODE = 0o100644;
  const entries = [];
  const walk = (abs, rel) => {
    for (const name of readdirSync(abs).sort()) {
      const a = path.join(abs, name);
      const r = rel ? `${rel}/${name}` : name;
      if (statSync(a).isDirectory()) {
        entries.push({ name: `${r}/`, data: Buffer.alloc(0), mode: DIR_MODE });
        walk(a, r);
      } else {
        entries.push({ name: r, data: readFileSync(a), mode: FILE_MODE });
      }
    }
  };
  walk(dir, '');

  const local = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const deflated = deflateRawSync(e.data);
    const stored = deflated.length >= e.data.length;
    const body = stored ? e.data : deflated;
    const crc = crc32(e.data);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4); // version needed
    lh.writeUInt16LE(0x0800, 6); // UTF-8 names
    lh.writeUInt16LE(stored ? 0 : 8, 8);
    lh.writeUInt16LE(0, 10); // time
    lh.writeUInt16LE(0x21, 12); // date 1980-01-01
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18);
    lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    local.push(lh, name, body);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE((3 << 8) | 20, 4); // made by Unix, so unzip applies the mode bits
    lh.copy(ch, 6, 4, 30); // version needed .. name length are identical
    ch.writeUInt16LE(0, 30); // extra
    ch.writeUInt16LE(0, 32); // comment
    ch.writeUInt16LE(0, 34); // disk
    ch.writeUInt16LE(0, 36); // internal attrs
    ch.writeUInt32LE((e.mode << 16) >>> 0, 38);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);

    offset += lh.length + name.length + body.length;
  }

  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
