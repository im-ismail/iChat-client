import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import { checkRooms, emitMessage, joinRoom } from '../../services/socket';
import { createRoomEndpoint, deleteUserEndpoint, getAllUsersEndpoint, logoutUserEndpoint, otpVerificationForRegistrationEndpoint, recentConversationsEndpoint, resendOtpForRegistrationEndpoint, roomConversationEndpoint, sendMessagEndpoint, updateProfilePicEndpoint, updateUserEndpoint, userAuthenticationEndpoint, userLoginEndpoint, userRegistrationEndpoint } from '../../api/apiEndpoint';

// Async function for checking user authentication
export const authenticateUser = createAsyncThunk('chat/authenticateUser', async () => {
    const res = await fetch(userAuthenticationEndpoint, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.message);
    };
    return data.user;
});

// Async function for user login
export const userLogin = createAsyncThunk('chat/login', async (userData) => {
    const res = await fetch(userLoginEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return data.user;
});

// Async function for user registration
export const userRegistration = createAsyncThunk('chat/registerSendOtp', async (userData) => {
    const res = await fetch(userRegistrationEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 100 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return;
});

// Async function for otp verification while registerig
export const completeRegistration = createAsyncThunk('chat/registerVerifyOtp', async (userData) => {
    const res = await fetch(otpVerificationForRegistrationEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message + ', redirecting to login page');
    return;
});

// Async function for user registration
export const resendOtpForRegistration = createAsyncThunk('chat/registerVerifyOtp', async (userData) => {
    const res = await fetch(resendOtpForRegistrationEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return;
});

// Getting all the users
export const getUsers = createAsyncThunk('chat/getUsers', async () => {
    const res = await fetch(getAllUsersEndpoint, {
        method: 'Get',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    return data.users;
});

// Fetching user recent conversation with other user
export const getRecentConversations = createAsyncThunk('chat/getRecentConversations', async () => {
    const res = await fetch(recentConversationsEndpoint, {
        method: 'Get',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    // Joining on those room where other user are already waiting
    const rooms = data.recentConversations.map(conversation => conversation.user.roomId);
    checkRooms(rooms);
    return data.recentConversations;
});

// Fetching user messages for a particular room
export const getConversationByRoomId = createAsyncThunk('chat/getConversationByRoomId', async (roomId) => {
    const res = await fetch(`${roomConversationEndpoint}/${roomId}`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    return { user: { ...data.user, roomId }, messages: data.messages };
});

//Inittiating chat room
const initiateChat = async (userId) => {
    try {
        const res = await fetch(createRoomEndpoint, {
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
    const res = await fetch(`${sendMessagEndpoint}/${roomId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
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
export const updateUser = createAsyncThunk('chat/updateUser', async ({ inputValue, userId }) => {
    const res = await fetch(`${updateUserEndpoint}/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inputValue),
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return data.user;
});

// logging out user
export const logoutUser = createAsyncThunk('chat/logout', async () => {
    const res = await fetch(logoutUserEndpoint, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return;
});

// deleting account
export const deleteUserAccount = createAsyncThunk('chat/deleteUserAccount', async ({ inputValue, userId }) => {
    const res = await fetch(`${deleteUserEndpoint}/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(inputValue)
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return;
});

// updating profile picture
export const updateProfilePicture = createAsyncThunk('chat/updateProfilePicture', async (imageFile) => {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    const res = await fetch(updateProfilePicEndpoint, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return data.user;
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
        markMessagesAsRead: (state, action) => {
            const { updatedMessages, roomId, otherUserId, unreadMessagesCount } = action.payload;
            // first updating recent conversation
            const updateConversationMessages = (conversations) => {
                return conversations.map(conversation => {
                    const { user, message } = conversation;
                    if (user.roomId === roomId) {
                        const updatedMessage = updatedMessages.find(msg => msg._id === message._id);
                        if (updatedMessage) {
                            return { user, message: { ...message, read: updatedMessage.read, unreadMessagesCount: user._id === otherUserId ? unreadMessagesCount : message.unreadMessagesCount } };
                        } else {
                            return conversation;
                        }
                    } else {
                        return conversation;
                    };
                });
            };

            state.recentConversations = updateConversationMessages(state.recentConversations);
            state.tempRecentConversations = updateConversationMessages(state.tempRecentConversations);

            // updating roomConversation and allRoomConversation
            const messages = state.roomConversation?.user.roomId === roomId ? state.roomConversation?.messages : state.allRoomConversations?.find(conversation => conversation.user.roomId === roomId)?.messages ?? null;
            if (!messages) return;
            const newUpdatedMessages = messages.map((message) => {
                const updatedMessage = updatedMessages.find(updatedMsg => updatedMsg._id === message._id);
                if (updatedMessage) {
                    return { ...message, read: updatedMessage.read };
                } else {
                    return message;
                };
            });

            state.roomConversation = state.roomConversation?.user.roomId === roomId ? { ...state.roomConversation, messages: newUpdatedMessages } : state.roomConversation;
            state.allRoomConversations = state.allRoomConversations?.map(conversation => {
                if (conversation.user.roomId === roomId) {
                    return { ...conversation, messages: newUpdatedMessages };
                } else {
                    return conversation;
                };
            });
        },
        markMessagesAsDelivered: (state, action) => {
            const { updatedMessages, roomId, otherUserId, unreadMessagesCount } = action.payload;
            // first updating recent conversation
            const updateConversationMessages = (conversations) => {
                return conversations.map(conversation => {
                    const { user, message } = conversation;
                    if (user.roomId === roomId) {
                        const updatedMessage = updatedMessages.find(msg => msg._id === message._id);
                        if (updatedMessage) {
                            return { user, message: { ...message, delivered: updatedMessage.delivered, unreadMessagesCount: user._id === otherUserId ? unreadMessagesCount : message.unreadMessagesCount } };
                        } else {
                            return conversation;
                        }
                    } else {
                        return conversation;
                    };
                });;
            };

            state.recentConversations = updateConversationMessages(state.recentConversations);
            state.tempRecentConversations = updateConversationMessages(state.tempRecentConversations);

            // updating roomConversation and allRoomConversation
            const messages = state.roomConversation?.user.roomId === roomId ? state.roomConversation?.messages : state.allRoomConversations?.find(conversation => conversation.user.roomId === roomId)?.messages ?? null;
            if (!messages) return;
            const newUpdatedMessages = messages.map((message) => {
                const updatedMessage = updatedMessages.find(updatedMsg => updatedMsg._id === message._id);
                if (updatedMessage) {
                    return { ...message, delivered: updatedMessage.delivered };
                } else {
                    return message;
                };
            });

            state.roomConversation = state.roomConversation?.user.roomId === roomId ? { ...state.roomConversation, messages: newUpdatedMessages } : state.roomConversation;
            state.allRoomConversations = state.allRoomConversations?.map(conversation => {
                if (conversation.user.roomId === roomId) {
                    return { ...conversation, messages: newUpdatedMessages };
                } else {
                    return conversation;
                };
            });
        },
    },
    extraReducers: builder => {
        // While checking user authentication
        builder.addCase(authenticateUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(authenticateUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.currentUser = action.payload;
        });
        builder.addCase(authenticateUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // While user login
        builder.addCase(userLogin.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(userLogin.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.currentUser = action.payload;
        });
        builder.addCase(userLogin.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // While user registration
        builder.addCase(userRegistration.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(userRegistration.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(userRegistration.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // While fetching all user
        builder.addCase(getUsers.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.isLoading = false;
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
            state.isError = null;
        });
        builder.addCase(getRecentConversations.fulfilled, (state, action) => {
            state.isLoading = false;
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
            state.isError = null;
        });
        builder.addCase(getConversationByRoomId.fulfilled, (state, action) => {
            state.isLoading = false;
            state.roomConversation = action.payload;
            state.allRoomConversations = [...state.allRoomConversations, action.payload];
        });
        builder.addCase(getConversationByRoomId.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // send message and update conversation
        builder.addCase(sendMessage.pending, (state, action) => {
            console.log("🚀 ~ file: chatSlice.js:516 ~ action:", action.meta)
            console.log("🚀 ~ file: chatSlice.js:517 ~ action:", action.payload)
            console.log("🚀 ~ file: chatSlice.js:518 ~ action:", action.type)
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isLoading = false;

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
        builder.addCase(updateUser.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentUser = action.payload;
        });
        builder.addCase(updateUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // logging out user
        builder.addCase(logoutUser.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(logoutUser.fulfilled, () => {
            return initialState;
        });
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // logging out user
        builder.addCase(deleteUserAccount.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(deleteUserAccount.fulfilled, () => {
            return initialState;
        });
        builder.addCase(deleteUserAccount.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // updating profile picture
        builder.addCase(updateProfilePicture.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(updateProfilePicture.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentUser = action.payload;
        });
        builder.addCase(updateProfilePicture.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
    }
});

export const { setRoomConversation, filterUsersList, filterChatList, setNewChat, updateReceivedConversation, updateUserStatus, updateTypingStatus, markMessagesAsRead, markMessagesAsDelivered } = chatSlice.actions;
export default chatSlice.reducer;