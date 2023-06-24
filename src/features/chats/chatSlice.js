import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { checkRooms, emitMessage, joinRoom } from '../../services/socket';
import { toast } from 'react-toastify';
import { registerUser, loginUser, authenticateUser, getAllUser, updateUser, logout, deleteUser } from '../../api/userAPI';
import { createRoom, recentConversations, roomConversation, sendMsg } from '../../api/chatAPI';

// Async function for checking user authentication
export const checkUserAuthentication = createAsyncThunk('chat/authenticate', async () => {
    const res = await fetch(authenticateUser, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.error);
    };
    return data.user;
});

// Async function for user login
export const handleUserLogin = createAsyncThunk('chat/login', async (userData) => {
    const res = await fetch(loginUser, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 500) {
            toast('Some error occured');
        } else {
            toast(data.error);
        };
        throw new Error(data.error);
    };
    toast('User login successful');
    return data.user;
});

// Async function for user registration
export const handleUserRegistration = createAsyncThunk('chat/register', async (userData) => {
    const date = new Date();
    const time_stamp = date.getTime();
    const res = await fetch(registerUser, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...userData, time_stamp })
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 500) {
            toast('Some error occured');
        } else {
            toast(data.error);
        };
        throw new Error(data.error);
    };
    toast('User registration successful, redirecting to login page');
    return data.message;
});

// Getting all the users
export const getUsers = createAsyncThunk('chat/getUsers', async () => {
    const res = await fetch(getAllUser, {
        method: 'Get',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    };
    return data.users;
});

// Fetching user recent conversation with other user
export const getRecentConversations = createAsyncThunk('chat/getRecentConversations', async () => {
    const res = await fetch(recentConversations, {
        method: 'Get',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    };
    // Joining on those room where other user are already waiting
    const rooms = data.recentConversations.map(conversation => conversation.user.roomId);
    checkRooms(rooms);
    return data.recentConversations;
});

// Fetching user messages for a particular room
export const getConversationByRoomId = createAsyncThunk('chat/getConversationByRoomId', async (roomId) => {
    const res = await fetch(`${roomConversation}/${roomId}`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    };
    return { user: { ...data.user, roomId }, messages: data.messages };
});

//Inittiating chat room
const initiateChat = async (userId) => {
    try {
        const res = await fetch(createRoom, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        return data.roomId;
    } catch (error) {
        console.log(error);
    };
};

// send message and update conversation
export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ message, roomId, otherUserId }, { getState, dispatch }) => {
    const { currentUser, newChat } = getState().chat;
    if (!roomId) {
        roomId = await initiateChat(otherUserId);
        // joining both user to the same room so they can receive message
        joinRoom(roomId, otherUserId);
    };
    // setting new chat value to null if there was is
    if (newChat) {
        dispatch(setNewChat(null));
    };
    const date = new Date();
    const time_stamp = date.getTime();
    const res = await fetch(`${sendMsg}/${roomId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, time_stamp, otherUserId }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    };
    // filtering current and other user
    const { users, message: receivedMessage, roomId: room } = data.conversation;
    const userSelf = users.filter(user => user._id === currentUser._id)[0];
    const otherUser = users.filter(user => user._id !== currentUser._id)[0];
    // sending message to other user
    emitMessage({ user: { ...userSelf, roomId: room }, message: receivedMessage });
    return { user: { ...otherUser, roomId: room }, message: receivedMessage };
});
// updaing current user details based on user request
export const updateUserDetails = createAsyncThunk('chat/updateUserDetails', async ({ inputValue, userId }) => {
    const res = await fetch(`${updateUser}/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inputValue),
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 500) {
            toast('Some error occured');
        } else {
            toast(data.error);
        };
        throw new Error(data.error);
    };
    toast(data.message);
    return data.user;
});

// logging out user
export const logoutUser = createAsyncThunk('chat/logout', async () => {
    const res = await fetch(logout, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
        toast('Some error occured');
        console.log(res, data);
        throw new Error(data.error);
    };
    toast(data.message);
    return data.message;
});

// deleting account
export const deleteUserAccount = createAsyncThunk('chat/deleteUserAccount', async ({ inputValue, userId }) => {
    const res = await fetch(`${deleteUser}/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(inputValue)
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 500) {
            toast('Some error occured');
        } else {
            toast(data.error);
        };
        throw new Error(data.error);
    };
    toast(data.message);
    return;
});

// Defining initial state
const initialState = {
    isLoading: false,
    isError: null,
    isLoggedIn: false,
    currentUser: null,
    users: null,
    tempUsers: null,
    notification: null,
    recentConversations: null,
    tempRecentConversations: null,
    roomConversation: null,
    allRoomConversations: [],
    newChat: null,
};

// Creating slicer
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setRoomConversation: (state, action) => {
            state.roomConversation = action.payload;
        },
        filterUsersList: (state, action) => {
            const inputValue = action.payload;
            const filteredUsers = state.tempUsers.filter((user) => {
                const { name, number } = user;
                return name.toLowerCase().includes(inputValue.toLowerCase()) || number.toString().includes(inputValue);
            });
            state.users = filteredUsers;
        },
        filterChatList: (state, action) => {
            const inputValue = action.payload;
            const filteredchats = state.tempRecentConversations.filter((conversation) => {
                const { user } = conversation;
                const { name, number } = user;
                return name.toLowerCase().includes(inputValue.toLowerCase()) || number.toString().includes(inputValue);
            });
            state.recentConversations = filteredchats;
        },
        setNewChat: (state, action) => {
            state.newChat = action.payload;
        },
        updateReceivedConversation: (state, action) => {
            const { user, message } = action.payload;
            // updating recent conversation
            const updateConversation = (conversations) => {
                const filteredConversation = conversations.filter((conversation) => {
                    return conversation.user.roomId !== user.roomId;
                });
                return [action.payload, ...filteredConversation];
            };
            // updating room conversation
            const roomConversation = state.roomConversation && state.roomConversation.user.roomId === user.roomId ? { ...state.roomConversation, messages: [...state.roomConversation.messages, message] } : state.roomConversation;
            //updating all room conversation
            const allRoomConversations = state.allRoomConversations.filter((conversation) => {
                return conversation.user.roomId !== user.roomId;
            });

            state.recentConversations = updateConversation(state.recentConversations);
            state.tempRecentConversations = updateConversation(state.tempRecentConversations);
            state.roomConversation = roomConversation;
            state.allRoomConversations = roomConversation ? [...allRoomConversations, roomConversation] : [];
        },
        updateUserStatus: (state, action) => {
            const updatedUser = action.payload;
            let matched;
            const updatedRecentConversations = state.recentConversations.map((conversation) => {
                if (conversation.user._id === updatedUser._id) {
                    matched = true;
                    return { ...conversation, user: { ...updatedUser, roomId: conversation.user.roomId } };
                } else {
                    return conversation;
                };
            });
            const updatedTempRecentConversations = state.tempRecentConversations.map((conversation) => {
                if (conversation.user._id === updatedUser._id) {
                    matched = true;
                    return { ...conversation, user: { ...updatedUser, roomId: conversation.user.roomId } };
                } else {
                    return conversation;
                };
            });
            const updatedUsers = state.users && state.users.map((user) => {
                if (user._id === updatedUser._id) {
                    matched = true;
                    return updatedUser;
                } else {
                    return user;
                };
            });
            const updatedAllRoomConversations = state.allRoomConversations && state.allRoomConversations.map((conversation) => {
                if (conversation.user._id === updatedUser._id) {
                    matched = true;
                    return { ...conversation, user: { ...updatedUser, roomId: conversation.user.roomId } };
                } else {
                    return conversation;
                };
            });
            // If unable to match any of the above condition then state will not be updated will be returned as it is
            if (!matched) {
                return;
            };
            state.recentConversations = updatedRecentConversations;
            state.tempRecentConversations = updatedTempRecentConversations;
            state.users = updatedUsers;
            state.roomConversation = state.roomConversation && state.roomConversation.user._id === updatedUser._id ? { ...state.roomConversation, user: { ...updatedUser, roomId: state.roomConversation.user.roomId } } : state.roomConversation;
            state.allRoomConversations = updatedAllRoomConversations;
        },
        updateTypingStatus: (state, action) => {
            const { roomId, typing } = action.payload;
            const updatedRecentConversations = state.recentConversations.map((conversation) => {
                if (conversation.user.roomId === roomId) {
                    return { ...conversation, user: { ...conversation.user, typing } };
                } else {
                    return conversation;
                };
            });
            state.recentConversations = updatedRecentConversations;
            state.roomConversation = state.roomConversation && state.roomConversation.user.roomId === roomId ? { ...state.roomConversation, user: { ...state.roomConversation.user, typing } } : state.roomConversation;
        },
    },
    extraReducers: builder => {
        // While checking user authentication
        builder.addCase(checkUserAuthentication.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(checkUserAuthentication.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.currentUser = action.payload;
        });
        builder.addCase(checkUserAuthentication.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // While user login
        builder.addCase(handleUserLogin.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(handleUserLogin.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.notification = 'User login successful';
            state.isError = null;
            state.currentUser = action.payload;
        });
        builder.addCase(handleUserLogin.rejected, (state, action) => {
            state.isLoading = false;
            state.notification = action.error.message;
            state.isError = action.error.message;
        });
        // While user registration
        builder.addCase(handleUserRegistration.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(handleUserRegistration.fulfilled, (state) => {
            state.isLoading = false;
            state.notification = 'User registration successful, redirecting to login page';
            state.isError = null;
        });
        builder.addCase(handleUserRegistration.rejected, (state, action) => {
            state.isLoading = false;
            state.notification = action.error.message;
            state.isError = action.error.message;
        });
        // While fetching all user
        builder.addCase(getUsers.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = null;
            const users = action.payload.filter(user => user._id !== state.currentUser._id);
            state.users = users;
            state.tempUsers = users;
        });
        builder.addCase(getUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // Getting recent conversation
        builder.addCase(getRecentConversations.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getRecentConversations.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = null;
            state.recentConversations = action.payload;
            state.tempRecentConversations = action.payload;
        });
        builder.addCase(getRecentConversations.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // Getting conversation by roomId
        builder.addCase(getConversationByRoomId.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getConversationByRoomId.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = null;
            state.roomConversation = action.payload;
            state.allRoomConversations = [...state.allRoomConversations, action.payload];
        });
        builder.addCase(getConversationByRoomId.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // send message and update conversation
        builder.addCase(sendMessage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = null;

            const { user, message } = action.payload;
            // updating recent conversation
            const updateConversation = (conversations) => {
                const filteredConversation = conversations.filter((conversation) => {
                    return conversation.user.roomId !== user.roomId;
                });
                return [action.payload, ...filteredConversation];
            };
            // updating room conversation
            const roomConversation = state.roomConversation && state.roomConversation.user.roomId === user.roomId ? { ...state.roomConversation, messages: [...state.roomConversation.messages, message] } : { user, messages: [message] };
            //updating all room conversation
            const allRoomConversations = state.allRoomConversations.filter((conversation) => {
                return conversation.user.roomId !== user.roomId;
            });

            state.recentConversations = updateConversation(state.recentConversations);
            state.tempRecentConversations = updateConversation(state.tempRecentConversations);
            state.roomConversation = roomConversation;
            state.allRoomConversations = [...allRoomConversations, roomConversation];
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // updating current user details
        builder.addCase(updateUserDetails.pending, (state) => {
            state.isError = null;
        });
        builder.addCase(updateUserDetails.fulfilled, (state, action) => {
            state.isError = null;
            state.currentUser = action.payload;
        });
        builder.addCase(updateUserDetails.rejected, (state, action) => {
            state.isError = action.error.message;
            state.notification = action.error.message;
        });
        // logging out user
        builder.addCase(logoutUser.pending, (state) => {
            state.isError = null;
        });
        builder.addCase(logoutUser.fulfilled, () => {
            return initialState;
        });
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.isError = action.error.message;
        });
        // logging out user
        builder.addCase(deleteUserAccount.pending, (state) => {
            state.isError = null;
        });
        builder.addCase(deleteUserAccount.fulfilled, () => {
            return initialState;
        });
        builder.addCase(deleteUserAccount.rejected, (state, action) => {
            state.isError = action.error.message;
        });
    }
});

export const { setRoomConversation, filterUsersList, filterChatList, setNewChat, updateReceivedConversation, updateUserStatus, updateTypingStatus } = chatSlice.actions;
export default chatSlice.reducer;