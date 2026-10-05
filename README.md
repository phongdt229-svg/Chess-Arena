# Chess Arena

Chess in the browser with 2D and 3D boards, a built-in computer opponent, clocks, saved games and accounts.
Monorepo: `packages/chess-core` (rules), `apps/web` (React + Vite site), `apps/api` (PHP + MySQL accounts).

## Develop

```bash
pnpm install
pnpm --filter @chess-arena/chess-core build   # the web app uses chess-core's built output; rebuild after changing it
pnpm --filter @chess-arena/web dev            # http://localhost:5173, sign-up/login use a mock API (accounts kept in apps/web/.dev-auth.json)
pnpm test                                     # unit tests
pnpm lint
pnpm --filter @chess-arena/web e2e            # browser tests (Playwright); set CHROME_PATH to use an installed Chrome
```

CI (`.github/workflows/ci.yml`) runs lint, unit tests, the build and the end-to-end tests on every push and pull request.

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

Troubleshooting sign-up: set `'debug' => true` in `config/config.php` to make the form show the real server error (database access denied,
missing table, ...). Set it back to `false` afterwards. A `403` page that is not JSON comes from the web server itself, so read the site's
`error_log` (CyberPanel: Websites, Manage, Logs).

To deploy from GitHub instead of uploading by hand, add the secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` and run the
**Deploy** workflow. Use the site's own user for `DEPLOY_USER` so the files get the right owner.

Optional ads: copy `apps/web/.env.example` to `apps/web/.env.production`, fill in your AdSense ids and rebuild.
