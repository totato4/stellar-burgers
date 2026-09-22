import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructor';
import { TConstructorIngredient } from '@utils-types';

describe('burgerConstructor reducer', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const mockBun: TConstructorIngredient = {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 100,
    price: 50,
    image: 'bun.png',
    image_large: 'bun_large.png',
    image_mobile: 'bun_mobile.png',
    id: 'bun-uuid'
  };

  const mockIngredient1: TConstructorIngredient = {
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
    image_mobile: 'sauce_mobile.png',
    id: 'sauce-uuid-1'
  };

  const mockIngredient2: TConstructorIngredient = {
    _id: '3',
    name: 'Начинка',
    type: 'main',
    proteins: 15,
    fat: 10,
    carbohydrates: 5,
    calories: 200,
    price: 100,
    image: 'main.png',
    image_large: 'main_large.png',
    image_mobile: 'main_mobile.png',
    id: 'main-uuid-2'
  };

  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('не должен изменять состояние при неизвестном экшене', () => {
    const state = {
      bun: mockBun,
      ingredients: [mockIngredient1]
    };
    const result = constructorReducer(state, { type: 'UNKNOWN' });
    expect(result).toEqual(state);
  });

  it('должен добавить булку при addIngredient', () => {
    const action = addIngredient(mockBun);
    const result = constructorReducer(initialState, action);
    expect(result.bun).toEqual(mockBun);
    expect(result.ingredients).toEqual([]);
  });

  it('должен добавить начинку при addIngredient', () => {
    const action = addIngredient(mockIngredient1);
    const result = constructorReducer(initialState, action);
    expect(result.bun).toBeNull();
    expect(result.ingredients).toEqual([mockIngredient1]);
  });

  it('должен добавить несколько ингредиентов', () => {
    let state = constructorReducer(
      initialState,
      addIngredient(mockIngredient1)
    );
    state = constructorReducer(state, addIngredient(mockIngredient2));
    expect(state.ingredients).toEqual([mockIngredient1, mockIngredient2]);
  });

  it('должен удалить ингредиент по id', () => {
    const stateWithIngredients = {
      bun: null,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = removeIngredient(mockIngredient1.id);
    const result = constructorReducer(stateWithIngredients, action);
    expect(result.ingredients).toEqual([mockIngredient2]);
  });

  it('должен переместить ингредиент вверх', () => {
    const stateWithIngredients = {
      bun: null,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = moveIngredient({ index: 1, direction: 'up' });
    const result = constructorReducer(stateWithIngredients, action);
    expect(result.ingredients).toEqual([mockIngredient2, mockIngredient1]);
  });

  it('должен переместить ингредиент вниз', () => {
    const stateWithIngredients = {
      bun: null,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = moveIngredient({ index: 0, direction: 'down' });
    const result = constructorReducer(stateWithIngredients, action);
    expect(result.ingredients).toEqual([mockIngredient2, mockIngredient1]);
  });

  it('не должен перемещать первый ингредиент вверх', () => {
    const stateWithIngredients = {
      bun: null,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = moveIngredient({ index: 0, direction: 'up' });
    const result = constructorReducer(stateWithIngredients, action);
    expect(result.ingredients).toEqual([mockIngredient1, mockIngredient2]);
  });

  it('не должен перемещать последний ингредиент вниз', () => {
    const stateWithIngredients = {
      bun: null,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = moveIngredient({ index: 1, direction: 'down' });
    const result = constructorReducer(stateWithIngredients, action);
    expect(result.ingredients).toEqual([mockIngredient1, mockIngredient2]);
  });

  it('должен очистить конструктор', () => {
    const stateWithIngredients = {
      bun: mockBun,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const action = clearConstructor();
    const result = constructorReducer(stateWithIngredients, action);
    expect(result).toEqual(initialState);
  });
});
