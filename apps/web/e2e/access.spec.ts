import { test, expect } from '@playwright/test';
import { register, uniqueName } from './helpers';

test('visitors see the home page and public pages without logging in', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Play chess right in your browser' })).toBeVisible();
  for (const [link, heading] of [
    ['Rules', 'Rules of chess'],
    ['Openings', 'Chess openings'],
    ['Guide', 'How to use Chess Arena'],
  ] as const) {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('the game is behind login and returns you to where you were headed', async ({ page }) => {
  await page.goto('/play');
  await expect(page).toHaveURL(/\/login\?next=%2Fplay/);
  await page.getByRole('tab', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/register\?next=%2Fplay/);
  await page.getByLabel('Username').fill(uniqueName());
  await page.getByLabel('Password', { exact: true }).fill('password1');
  await page.getByLabel('Confirm password').fill('password1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator('.board-2d')).toBeVisible();
});

test('unknown addresses show the 404 page', async ({ page }) => {
  await page.goto('/definitely-not-here');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('login errors are explained and usernames ignore letter case', async ({ page, context }) => {
  const name = await register(page, `Case${Date.now().toString().slice(-6)}`);
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/login');
  await page.getByLabel('Username').fill(name.toLowerCase());
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Wrong username or password.');

  await page.getByLabel('Password', { exact: true }).fill('password1');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('.board-2d')).toBeVisible();

  // a session survives a reload
  await page.reload();
  await expect(page.locator('.board-2d')).toBeVisible();
  void context;
});
