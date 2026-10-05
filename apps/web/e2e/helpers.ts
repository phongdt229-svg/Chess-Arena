import { expect, type Page } from '@playwright/test';

let counter = 0;

export function uniqueName(prefix = 'e2e') {
  counter += 1;
  return `${prefix}${Date.now().toString().slice(-6)}${counter}`.slice(0, 20);
}

export async function register(page: Page, username = uniqueName()) {
  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('password1');
  await page.getByLabel('Confirm password').fill('password1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.locator('.board-2d')).toBeVisible();
  return username;
}

export const square = (page: Page, name: string) => page.locator(`.board-2d [data-square="${name}"]`);

export async function playMove(page: Page, from: string, to: string) {
  await square(page, from).click();
  await square(page, to).click();
}

export const moveList = (page: Page) => page.locator('.move-btn');
