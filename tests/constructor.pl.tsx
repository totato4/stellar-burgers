import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page, context }) => {
    // Мокируем все backend-запросы через HAR
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    await page.routeFromHAR('tests/hars/auth-user.har', {
      url: '**/api/auth/user',
      update: false
    });

    await page.routeFromHAR('tests/hars/orders.har', {
      url: '**/api/orders',
      update: false
    });

    // Устанавливаем моковые токены авторизации
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

    // Скрываем overlay от webpack-dev-server
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

    const bunCard = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.locator('button:has-text("Добавить")').click();

    await expect(
      constructorSection.locator('text=Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      constructorSection.locator('text=Краторная булка N-200i (низ)')
    ).toBeVisible();

    const mainCard = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Магнолии' });
    await mainCard.locator('button:has-text("Добавить")').click();

    await expect(
      constructorSection
        .locator('li')
        .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
    ).toBeVisible();

    const sauceCard = page.locator('li').filter({ hasText: 'Соус Spicy-X' });
    await sauceCard.locator('button:has-text("Добавить")').click();

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

    const modal = page.locator('#modals');

    // Заголовок
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();

    // Название ингредиента
    await expect(modal.locator('text=Краторная булка N-200i')).toBeVisible();

    // Подписи полей
    await expect(modal.locator('text=Калории, ккал')).toBeVisible();
    await expect(modal.locator('text=Белки, г')).toBeVisible();
    await expect(modal.locator('text=Жиры, г')).toBeVisible();
    await expect(modal.locator('text=Углеводы, г')).toBeVisible();

    // Значения БЖУ конкретного ингредиента
    await expect(modal.locator('text=420')).toBeVisible(); // калории
    await expect(modal.locator('text=80')).toBeVisible(); // белки
    await expect(modal.locator('text=24')).toBeVisible(); // жиры
    await expect(modal.locator('text=53')).toBeVisible(); // углеводы
  });

  test('закрытие модального окна по клику на крестик', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunLink = page
      .locator('a')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunLink.click();

    const modal = page.locator('#modals');
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();

    await modal.locator('button').first().click();

    await expect(modal.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('закрытие модального окна по клику на оверлей', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const bunLink = page
      .locator('a')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunLink.click();

    const modal = page.locator('#modals');
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();

    await modal
      .locator('> div')
      .last()
      .click({ position: { x: 10, y: 10 } });

    await expect(modal.locator('text=Детали ингредиента')).not.toBeVisible();
  });

  test('создание заказа', async ({ page }) => {
    await expect(page.locator('text=Краторная булка N-200i')).toBeVisible();

    const constructorSection = page.locator('section').filter({
      has: page.locator('button:has-text("Оформить заказ")')
    });

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

    await constructorSection
      .locator('button:has-text("Оформить заказ")')
      .click();

    const modal = page.locator('#modals');

    await expect(modal.locator('text=идентификатор заказа')).toBeVisible();
    await expect(modal.locator('text=12345')).toBeVisible();

    await expect(constructorSection.locator('text=(верх)')).not.toBeVisible();
    await expect(constructorSection.locator('text=(низ)')).not.toBeVisible();
    await expect(
      constructorSection.locator('text=Выберите начинку')
    ).toBeVisible();

    await modal.locator('button').first().click();
    await expect(modal.locator('text=идентификатор заказа')).not.toBeVisible();
  });
});
