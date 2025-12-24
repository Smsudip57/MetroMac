// import {configureStore} from "@reduxjs/toolkit";
// import {
//     FLUSH,
//     PAUSE,
//     PERSIST,
//     persistReducer,
//     persistStore,
//     PURGE,
//     REGISTER,
//     REHYDRATE,
// } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import {baseApi} from "./api/baseApi";
// import authReducer from "./features/authSlice";

// const authPersistConfig = {
//     key: "auth",
//     storage,
//     whitelist: ["user", "token"],
// };

// const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

//                     PAUSE,
//                     PERSIST,
//                     PURGE,
//                     REGISTER,
//                 ],
//             },
//         }).concat(baseApi.middleware),

//     devTools: process.env.NODE_ENV !== "production",
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export const persistor = persistStore(store);

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import sidebarReducer from "./features/sidebarSlice";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

//     reducer: {
//         [baseApi.reducerPath]: baseApi.reducer,
//         auth: authReducer,
//         theme: themeReducer,
//     },
//     middleware: (getDefaultMiddlewares) =>
//         getDefaultMiddlewares().concat(baseApi.middleware),

//     devTools: process.env.NODE_ENV !== "production",
// });
const sidebarPersistConfig = {
  key: "sidebar",
  storage,
  whitelist: ["isSidebarCollapsed"],
};

export const store = configureStore({
  reducer: Object.assign(
    {
      auth: authReducer,
      theme: themeReducer,
      sidebar: persistReducer(sidebarPersistConfig, sidebarReducer),
    },
    {
      [baseApi.reducerPath]: baseApi.reducer,
    }
  ),
  middleware: (getDefaultMiddlewares) =>
    getDefaultMiddlewares({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
