import { configureStore } from "@reduxjs/toolkit";
import {
    persistReducer,
    persistStore
} from "redux-persist";
import logger from "redux-logger";

import storage from "redux-persist/lib/storage";
import { todoApi } from "@/store/api/todoApi";
import { todoItemsApi } from "./api";
import rootReducer from "@/store/rootReducer";

const persistConfig = {
    key: "root",
    storage,
    blacklist: [todoApi.reducerPath, todoItemsApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const ENABLE_LOGGER = import.meta.env.VITE_USE_REDUX_LOGGER === 'true';

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
        const middlewares = getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            todoApi.middleware,
            todoItemsApi.middleware
        );

        if (ENABLE_LOGGER) {
            middlewares.push(logger);
        }

        return middlewares;
    },
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
