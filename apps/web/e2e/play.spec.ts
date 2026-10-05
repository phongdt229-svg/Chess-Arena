import { test, expect } from '@playwright/test';
import { moveList, playMove, register, square } from './helpers';

test('play, undo, review and hint on the 2D board', async ({ page }) => {
  await register(page);

  await playMove(page, 'e2', 'e4');
  await playMove(page, 'e7', 'e5');
  await playMove(page, 'g1', 'f3');
  await expect(moveList(page)).toHaveText(['e4', 'e5', 'Nf3']);

  // an illegal move is ignored
  await playMove(page, 'a2', 'a5');
  await expect(moveList(page)).toHaveCount(3);

  // review an earlier position, moves are blocked, and Back to game returns
  await moveList(page).nth(0).click();
  await expect(page.locator('.review-badge')).toContainText('move 1 of 3');
  await expect(square(page, 'f3').locator('.piece')).toHaveCount(0);
  await playMove(page, 'd7', 'd5');
  await expect(moveList(page)).toHaveCount(3);
  await page.getByRole('button', { name: 'Back to game' }).click();
  await expect(square(page, 'f3').locator('.piece')).toHaveCount(1);

  // hint highlights two squares and names a move
  await page.getByRole('button', { name: /Hint/ }).click();
  await expect(page.locator('.hint-line')).toContainText('Suggested move');
  await expect(page.locator('.square.hint-from, .square.hint-to')).toHaveCount(2);

  await page.getByRole('button', { name: /Undo/ }).click();
  await expect(moveList(page)).toHaveCount(2);
});

test('drag and drop with the mouse, including a capture', async ({ page }) => {
  await register(page);
  const drag = async (from: string, to: string) => {
    const a = (await square(page, from).boundingBox())!;
    const b = (await square(page, to).boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
    await page.mouse.up();
  };
  await drag('e2', 'e4');
  await drag('d7', 'd5');
  await drag('e4', 'd5');
  await expect(moveList(page)).toHaveText(['e4', 'd5', 'exd5']);
});

test('playing the computer: it answers, and Resign ends the game', async ({ page }) => {
  await register(page);
  await page.getByRole('button', { name: 'New Game' }).first().click();
  await page.getByLabel('Play vs AI').check();
  await page.getByLabel('White', { exact: true }).check(); // the default colour is random
  await page.locator('.slider').fill('1');
  await page.getByRole('button', { name: 'Start Game' }).click();
  await playMove(page, 'e2', 'e4');
  await expect(moveList(page)).toHaveCount(2, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Resign' }).click();
  await expect(page.locator('.game-over-modal')).toContainText('wins by resignation');
});

test('the game resumes after a reload', async ({ page }) => {
  await register(page);
  await playMove(page, 'd2', 'd4');
  await playMove(page, 'd7', 'd5');
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Resume game' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(moveList(page)).toHaveText(['d4', 'd5']);
});

test('3D board loads and the evaluation bar works', async ({ page }) => {
  await register(page);
  await page.getByRole('button', { name: /Evaluation: Off/ }).click();
  await expect(page.locator('.eval-bar .eval-label')).not.toHaveText('…');
  await page.getByRole('button', { name: '3D View' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.eval-bar.floating')).toBeVisible();
  await page.getByRole('button', { name: /Reset View/ }).click();
});
