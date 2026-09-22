export const mockUser = {
  success: true,
  user: {
    email: 'test@test.com',
    name: 'Test User',
  },
};

export const mockOrder = {
  success: true,
  name: 'Space Burger',
  order: {
    _id: 'mock-order-id',
    status: 'done',
    name: 'Space Burger',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    number: 12345,
    price: 1835,
    owner: {
      name: 'Test User',
      email: 'test@test.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ingredients: [
      '643d69a5c3f7b9001cfa093c',
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0942',
    ],
  },
};
