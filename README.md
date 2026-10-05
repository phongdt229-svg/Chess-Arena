# Chess Arena

Chess in the browser with 2D and 3D boards, a built-in computer opponent, clocks, saved games and accounts.
Monorepo: `packages/chess-core` (rules), `apps/web` (React + Vite site), `apps/api` (PHP + MySQL accounts).

## Develop

```bash
pnpm install
pnpm --filter @chess-arena/web dev     # http://localhost:5173, sign-up/login use an in-memory mock API
pnpm test                              # unit tests
```

## Deploy (PHP 8.1+ and MySQL, no Node needed on the server)

1. **Build** on your own machine: `pnpm --filter @chess-arena/web build`.
   `apps/web/dist/` now contains the website **and** the PHP API in `dist/api/`.
2. **Upload** the *contents* of `dist/` into the web root (`public_html/`), including hidden files (`.htaccess`, `api/.htaccess`, `api/lib/.htaccess`).
3. **Database**: create a MySQL database and user, then import `apps/api/schema.sql` (it is not uploaded on purpose).
4. **Config**: copy `apps/api/config.example.php` to `config/config.php` in the folder **above** `public_html`
   (for example `/home/example.com/config/config.php` when the web root is `/home/example.com/public_html`) and fill in the database details.
5. **Check** `https://your-domain/api/health.php`. It must answer `"ok": true`; otherwise `next` says what is missing.
   Delete `api/health.php` once everything works if you prefer not to expose it.
6. File ownership and permissions: folders `755`, files `644`, **owned by the site's own user, not root**.
   On LiteSpeed/CyberPanel, PHP files owned by another user (for example after uploading or extracting as root) or writable by group/others
   are refused with `403 Forbidden`, while static files such as `index.html` still load. Fix with
   `chown -R SITEUSER:SITEUSER public_html` (the site user is the owner of `public_html`: `stat -c %U public_html`) and the chmod values above.

Optional ads: copy `apps/web/.env.example` to `apps/web/.env.production`, fill in your AdSense ids and rebuild.
