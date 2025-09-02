import {configureStore} from '@reduxjs/toolkit';
import {apiSlice} from './slices/apiSlice';
import authSliceReducer from "./slices/authSlice"

const store = configureStore({
    reducer:{
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSliceReducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore RTK Query actions and paths that may contain Blob/Stream
                ignoredActions: [
                    'api/executeQuery/pending',
                    'api/executeQuery/fulfilled',
                    'api/executeQuery/rejected',
                ],
                ignoredPaths: ['api.queries'],
            },
        }).concat(apiSlice.middleware),
    devTools: true

})


export default store;