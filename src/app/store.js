import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chats/chatSlice";

const store = configureStore({
    reducer: {
        chat: chatReducer
    }
});

export default store;