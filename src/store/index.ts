import { configureStore } from '@reduxjs/toolkit';
import { mrConstrucaoApi } from '../services/api';

export const store = configureStore({
  reducer: {
    [mrConstrucaoApi.reducerPath]: mrConstrucaoApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mrConstrucaoApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
