import { test, expect } from '@playwright/test';
import { register, square } from './helpers';

test('openings page steps through moves and hands the position to the board', async ({ page }) => {
  await page.goto('/openings');
  await page.getByRole('button', { name: /Sicilian Defence/ }).click();
  await page.getByRole('button', { name: 'Previous move' }).click();
  await expect(page.locator('.openings-controls')).toContainText('9/10');
  await page.getByRole('button', { name: 'Try this on the board' }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('puzzles: wrong moves are undone, the right one solves and is remembered', async ({ page }) => {
  await register(page);
  await page.goto('/puzzles');
  await expect(page.getByRole('heading', { name: 'Back rank' })).toBeVisible();

  await square(page, 'a1').click();
  await square(page, 'a7').click();
  await expect(page.locator('.puzzle-status')).toHaveText('Not quite, try another move.');
  await expect(page.locator('.puzzle-status')).toHaveText('Find your move.');

  await square(page, 'a1').click();
  await square(page, 'a8').click();
  await expect(page.locator('.puzzle-status')).toHaveText('Correct, checkmate!');
  await expect(page.locator('.page-lead')).toContainText('Solved 1 of');

  await page.reload();
  await expect(page.locator('.page-lead')).toContainText('Solved 1 of');
});
