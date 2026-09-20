import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredients';
import userReducer from './slices/user';
import ordersReducer from './slices/orders';
import constructorReducer from './slices/constructor';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  user: userReducer,
  orders: ordersReducer,
  burgerConstructor: constructorReducer
});

export default rootReducer;
