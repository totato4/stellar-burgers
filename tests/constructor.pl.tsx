import { test, expect } from '@playwright/test';
import { mockUser, mockOrder } from './mocks';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });
    await page.goto('/');

    // Для скрытия overlay от webpack-dev-server, тесты не проходили из-за линтера, проблему решил с линтером, но решил оставить.
    await page.addStyleTag({
      content: `
      #webpack-dev-server-client-overlay {
        display: none !important;
        pointer-events: none !important;
      }
    `
    });
  });

  test('добавление ингредиентов из списка в конструктор', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const constructorSection = page.locator('section').filter({
      has: page.locator('button:has-text("Оформить заказ")')
    });

    // Булка добавляется
    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.locator('button:has-text("Добавить")').click();

    // булки в конструкторе
    await expect(
      page.locator('text=Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      page.locator('text=Краторная булка N-200i (низ)')
    ).toBeVisible();

    // добавить начинку
    const mainCard = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' });
    await mainCard.locator('button:has-text("Добавить")').click();

    // Начинка в конструкторе
    await expect(
      constructorSection
        .locator('li')
        .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
    ).toBeVisible();

    // Добавить соус
    const sauceCard = page.locator('li').filter({ hasText: 'Соус Spicy-X' });
    await sauceCard.locator('button:has-text("Добавить")').click();

    // Соус в конструкторе
    await expect(
      constructorSection.locator('li').filter({ hasText: 'Соус Spicy-X' })
    ).toBeVisible();
  });

  test('открытие модального окна ингредиента', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunLink = page
      .locator('a')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunLink.click();

    await expect(page).toHaveURL(/\/ingredients\/.+/);

    await expect(page.locator('text=Детали ингредиента')).toBeVisible();
    await expect(page.locator('text=Калории, ккал')).toBeVisible();
  });

  test('закрытие модального окна по клику на крестик', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunLink = page
      .locator('a')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunLink.click();

    await expect(page.locator('text=Детали ингредиента')).toBeVisible();

    // Клик по крестику — кнопка внутри #modals
    await page.locator('#modals button').first().click();

    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('закрытие модального окна по клику на оверлей', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunLink = page
      .locator('a')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunLink.click();

    await expect(page.locator('text=Детали ингредиента')).toBeVisible();

    // Клик по оверлею в точке, где нет модалки
    await page
      .locator('#modals > div')
      .last()
      .click({ position: { x: 10, y: 10 } });

    await expect(page.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('создание заказа', async ({ page, context }) => {
    // Мок пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser)
      });
    });

    // Мок заказа
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrder)
        });
      } else {
        await route.continue();
      }
    });

    // моковые токены
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.locator('button:has-text("Добавить")').click();

    const mainCard = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' });
    await mainCard.locator('button:has-text("Добавить")').click();

    const sauceCard = page.locator('li').filter({ hasText: 'Соус Spicy-X' });
    await sauceCard.locator('button:has-text("Добавить")').click();

    await page.locator('button:has-text("Оформить заказ")').click();

    await expect(page.locator('text=идентификатор заказа')).toBeVisible();

    await expect(page.locator('text=12345')).toBeVisible();

    await expect(page.locator('text=(верх)')).not.toBeVisible();
    await expect(page.locator('text=(низ)')).not.toBeVisible();
    await expect(page.locator('text=Выберите начинку')).toBeVisible();

    await page.locator('#modals button').first().click();
    await expect(page.locator('text=идентификатор заказа')).not.toBeVisible();
  });
});
