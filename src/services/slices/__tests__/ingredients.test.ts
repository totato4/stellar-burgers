import ingredientsReducer, { fetchIngredients } from '../ingredients';
import { TIngredient } from '@utils-types';

describe('ingredients reducer', () => {
  const initialState = {
    ingredients: [],
    loading: false,
    error: null
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      proteins: 10,
      fat: 5,
      carbohydrates: 20,
      calories: 100,
      price: 50,
      image: 'image.png',
      image_large: 'image_large.png',
      image_mobile: 'image_mobile.png'
    },
    {
      _id: '2',
      name: 'Соус',
      type: 'sauce',
      proteins: 1,
      fat: 2,
      carbohydrates: 3,
      calories: 30,
      price: 20,
      image: 'sauce.png',
      image_large: 'sauce_large.png',
      image_mobile: 'sauce_mobile.png'
    }
  ];

  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('не должен изменять состояние при неизвестном экшене', () => {
    const state = {
      ingredients: mockIngredients,
      loading: false,
      error: null
    };
    const result = ingredientsReducer(state, { type: 'UNKNOWN' });
    expect(result).toEqual(state);
  });

  it('должен установить loading=true при fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const result = ingredientsReducer(initialState, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен сохранить ингредиенты при fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredients
    };
    const result = ingredientsReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.ingredients).toEqual(mockIngredients);
  });

  it('должен установить ошибку при fetchIngredients.rejected', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка загрузки' }
    };
    const result = ingredientsReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.error).toBe('Ошибка загрузки');
  });
});
