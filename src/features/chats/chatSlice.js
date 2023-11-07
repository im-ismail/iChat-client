import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import { checkRooms, joinRoom } from '../../services/socket';
import {
    PassResetEndpoint,
    createRoomEndpoint,
    deleteChatEndpoint,
    deleteUserEndpoint,
    editMessageEndpoint,
    emailChangeEndpoint,
    everyoneMessageDeleteEndpoint,
    getAllUsersEndpoint,
    logoutUserEndpoint,
    markDeliveredEndpoint,
    markSeenEndpoint,
    recentConversationsEndpoint,
    resendOtpForRegistrationEndpoint,
    roomConversationEndpoint,
    sendMessagEndpoint,
    sendOtpForEmailChangeEndpoint,
    sendOtpForPassResetEndpoint,
    sendOtpForRegistrationEndpoint,
    singleMessageDeleteEndpoint,
    updateProfilePicEndpoint,
    updateUserEndpoint,
    userAuthenticationEndpoint,
    userLoginEndpoint,
    verifyOtpForPassResetEndpoint,
    verifyOtpForRegistrationEndpoint
} from '../../api/apiEndpoint';

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
    const res = await fetch(sendOtpForRegistrationEndpoint, {
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
    const res = await fetch(verifyOtpForRegistrationEndpoint, {
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

// Async function for otp regeneration while registerig
export const resendOtpForRegistration = createAsyncThunk('chat/registerResendOtp', async (userData) => {
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
export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ message, roomId, otherUserId }, { getState }) => {
    const { newChat } = getState().chat;
    if (!roomId) {
        // initiating room if not already created
        roomId = await initiateChat(otherUserId);
        // joining both user to the same room so they can receive message
        joinRoom(roomId, otherUserId);
    };
    // setting new chat value to null if there was is
    // will do same thing when updating conversation that will solve problem related to roomConversation when more than one tab open
    if (newChat) {
        // dispatch(setNewChat(null));
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
    return data;
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

// Async function for user registration
export const verifyEmailForPassReset = createAsyncThunk('chat/passResetSendOtp', async (email) => {
    const res = await fetch(sendOtpForPassResetEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
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
export const verifyOtpForPassReset = createAsyncThunk('chat/PassResetVerifyOtp', async (userData) => {
    const res = await fetch(verifyOtpForPassResetEndpoint, {
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
    return;
});

// Async function for user registration
export const resetPassword = createAsyncThunk('chat/passResetResendOtp', async (userData) => {
    if (userData.password !== userData.cPassword) {
        toast("Password and confirm password doesn't match");
        throw new Error("Password and confirm password doesn't match");
    };
    const res = await fetch(PassResetEndpoint, {
        method: 'PUT',
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
    return;
});

// sending otp for changing email address
export const sendOtpForEmailChange = createAsyncThunk('chat/changeEmailSendOtp', async ({ inputValue, userId }) => {
    const res = await fetch(`${sendOtpForEmailChangeEndpoint}/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inputValue),
    });
    const data = await res.json();
    if (!res.ok) {
        console.log(res);
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return;
});

// sending otp for changing email address
export const changeUserEmail = createAsyncThunk('chat/changeEmail', async ({ inputValue, userId }) => {
    const res = await fetch(`${emailChangeEndpoint}/${userId}`, {
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

// editing message
export const editMessage = createAsyncThunk('chat/editMessage', async ({ content, messageId }) => {
    const res = await fetch(`${editMessageEndpoint}/${messageId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.message.length < 80 ? data.message : 'Some error occured');
        throw new Error(data.message);
    };
    toast(data.message);
    return data.data;
});

// mark messages as delivered
export const markMessagesAsDelivered = async (roomId, otherUserId) => {
    try {
        const res = await fetch(markDeliveredEndpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ roomId, otherUserId }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        };
    } catch (error) {
        console.log(error);
    };
};
// mark messages as seen
export const markMessagesAsSeen = async (unreadMessagesIds, roomId, otherUserId) => {
    try {
        const res = await fetch(markSeenEndpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ ids: unreadMessagesIds, roomId, otherUserId }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        };
    } catch (error) {
        console.log(error);
    };
};
// deleting message for single user
export const deleteMessageForSingleUser = createAsyncThunk('chat/deleteForMe', async ({ messageId, senderId }) => {
    const res = await fetch(`${singleMessageDeleteEndpoint}/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ senderId }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    return data.updatedMessage;
});
// deleting message for everyone
export const deleteMessageForEveryone = createAsyncThunk('chat/deleteForEveryone', async ({ messageId, senderId }) => {
    const res = await fetch(`${everyoneMessageDeleteEndpoint}/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ senderId }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    return data.updatedMessage;
});
// deleting entire chat
export const deleteChat = createAsyncThunk('chat/deleteChat', async (roomId) => {
    const res = await fetch(deleteChatEndpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roomId }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message);
    };
    toast(data.message);
    return data.roomId;
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
    isConnected: true,
    pendingMessages: JSON.parse(localStorage.getItem('pendingMessages')) || []
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
                const { name, email } = user;
                return name.toLowerCase().includes(inputValue.toLowerCase()) || email.includes(inputValue);
            });
            state.users = filteredUsers;
        },
        filterChatList: (state, action) => {
            const inputValue = action.payload;
            const filteredchats = state.tempRecentConversations.filter((conversation) => {
                const { user } = conversation;
                const { name, email } = user;
                return name.toLowerCase().includes(inputValue.toLowerCase()) || email.includes(inputValue);
            });
            state.recentConversations = filteredchats;
        },
        setNewChat: (state, action) => {
            state.newChat = action.payload;
        },
        updateReceivedConversation: (state, action) => {
            const { sender, receiver, message } = action.payload;
            const isSender = state.currentUser._id === sender._id;
            const user = isSender ? receiver : sender;
            // updating recent conversation
            const updateConversation = (conversations) => {
                const filteredConversation = conversations.filter((conversation) => {
                    return conversation.user.roomId !== user.roomId;
                });
                return [{ user, message }, ...filteredConversation];
            };
            state.recentConversations = updateConversation(state.recentConversations);
            state.tempRecentConversations = updateConversation(state.tempRecentConversations);
            if (!state.roomConversation && (!isSender || !state.newChat)) return;

            // updating room conversation
            const roomConversation = state.roomConversation && state.roomConversation.user.roomId === user.roomId ? { ...state.roomConversation, messages: [...state.roomConversation.messages, message] } : isSender && state.newChat ? { user, messages: [message] } : state.roomConversation;
            //updating all room conversation
            const allRoomConversations = state.allRoomConversations.filter((conversation) => {
                return conversation.user.roomId !== user.roomId;
            });

            state.roomConversation = roomConversation;
            // this will solve the problem of being added this single conversation in other tab room roomConversation when there is no roomConversation in other tab. additional check applied above '&& state.newChat'
            state.newChat = null;
            state.allRoomConversations = [...allRoomConversations, roomConversation];
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
            const { roomId, typingUserId, typing } = action.payload;
            // added additional check '&& state.currentUser._id !== typingUserId' to solve problem of same user from other tab getting typing event. typing status should update only chat partner not same user from other tab
            const updatedRecentConversations = state.recentConversations.map((conversation) => {
                if (conversation.user.roomId === roomId && state.currentUser._id !== typingUserId) {
                    return { ...conversation, user: { ...conversation.user, typing } };
                } else {
                    return conversation;
                };
            });
            state.recentConversations = updatedRecentConversations;
            state.roomConversation = state.roomConversation && state.roomConversation.user.roomId === roomId && state.currentUser._id !== typingUserId ? { ...state.roomConversation, user: { ...state.roomConversation.user, typing } } : state.roomConversation;
        },
        updateDeliveredMessages: (state, action) => {
            const { updatedMessages, roomId, otherUserId, unreadMessagesCount } = action.payload;
            // first updating recent conversation
            const updateConversationMessages = (conversations) => {
                return conversations.map(conversation => {
                    const { user, message } = conversation;
                    if (user.roomId === roomId) {
                        const updatedMessage = updatedMessages.find(msg => msg._id === message._id);
                        return { user, message: { ...message, delivered: updatedMessage.delivered, unreadMessagesCount: user._id === otherUserId ? unreadMessagesCount : message.unreadMessagesCount } };
                    } else {
                        return conversation;
                    };
                });;
            };

            state.recentConversations = updateConversationMessages(state.recentConversations);
            state.tempRecentConversations = updateConversationMessages(state.tempRecentConversations);

            // updating roomConversation and allRoomConversation
            if (!state.roomConversation) return;
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
        updateSeenMessages: (state, action) => {
            const { updatedMessages, roomId, otherUserId, unreadMessagesCount } = action.payload;
            // first updating recent conversation
            const updateConversationMessages = (conversations) => {
                return conversations.map(conversation => {
                    const { user, message } = conversation;
                    if (user.roomId === roomId) {
                        const updatedMessage = updatedMessages.find(msg => msg._id === message._id);
                        // here changing delivered status because if user online and not connected to room and other user comes online message status changes to delivered in database and also emit event but user not able to receive event because room connection was not established at that time // ××× no need, fixed from server side
                        if (updatedMessage) {
                            return { user, message: { ...message, read: updatedMessage.read, unreadMessagesCount: user._id === otherUserId ? unreadMessagesCount : message.unreadMessagesCount } };
                        } else {
                            return { user, message: { ...message, unreadMessagesCount: user._id === otherUserId ? unreadMessagesCount : message.unreadMessagesCount } };
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
        updateEditedMessage: (state, action) => {
            const editedMessage = action.payload;
            const updateRecentConversations = (conversations) => {
                return conversations.map((conversation) => {
                    if (conversation.message._id === editedMessage._id) {
                        return { user: { ...conversation.user }, message: { ...conversation.message, content: editedMessage.content, isEdited: editedMessage.isEdited } };
                    } else {
                        return conversation;
                    };
                });
            };
            state.recentConversations = updateRecentConversations(state.recentConversations);
            state.tempRecentConversations = updateRecentConversations(state.tempRecentConversations);

            if (!state.roomConversation) return;

            const filteredRoomConversation = state.allRoomConversations.filter(conversation => conversation.user.roomId === editedMessage.roomId);
            if (!filteredRoomConversation.length) return;

            const { user, messages } = filteredRoomConversation[0];
            const updatedMessages = messages.map((message) => {
                if (message._id === editedMessage._id) {
                    return { ...message, content: editedMessage.content, isEdited: editedMessage.isEdited };
                } else {
                    return message
                };
            });
            const updatedRoomConversation = { user, messages: updatedMessages };
            state.roomConversation = state.roomConversation.user.roomId === user.roomId ? { ...state.roomConversation, messages: updatedMessages } : state.roomConversation;
            state.allRoomConversations = state.allRoomConversations.map((conversation) => {
                if (conversation.user.roomId === editedMessage.roomId) {
                    return updatedRoomConversation;
                } else {
                    return conversation;
                };
            });
        },
        updateEveryoneDeletedMessage: (state, action) => {
            const updatedMessage = action.payload;
            const { _id, roomId, content, deletedForEveryone } = updatedMessage;
            const updateRecentConversations = (conversations) => {
                return conversations.map((conversation) => {
                    const { message } = conversation;
                    if (message._id === _id) {
                        return { ...conversation, message: { ...message, content, deletedForEveryone } };
                    } else {
                        return conversation;
                    };
                });
            };
            state.recentConversations = updateRecentConversations(state.recentConversations);
            state.tempRecentConversations = updateRecentConversations(state.tempRecentConversations);

            if (!state.roomConversation) return;
            const filteredRoomConversation = state.allRoomConversations.filter(conversation => conversation.user.roomId === roomId);
            if (!filteredRoomConversation.length) return;

            const { user, messages } = filteredRoomConversation[0];
            const updatedMessages = messages.map((message) => {
                if (message._id === _id) {
                    return { ...message, content, deletedForEveryone };
                } else {
                    return message
                };
            });
            const updatedRoomConversation = { user, messages: updatedMessages };
            state.roomConversation = state.roomConversation.user.roomId === roomId ? { ...state.roomConversation, messages: updatedMessages } : state.roomConversation;
            state.allRoomConversations = state.allRoomConversations.map((conversation) => {
                if (conversation.user.roomId === roomId) {
                    return updatedRoomConversation;
                } else {
                    return conversation;
                };
            });
        },
        updateConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        },
        updatePendingMessages: (state, action) => {
            state.pendingMessages = action.payload;
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
        // While otp generation for registration
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
        // While otp verification for registration
        builder.addCase(completeRegistration.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(completeRegistration.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(completeRegistration.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // While otp regeneration for registration
        builder.addCase(resendOtpForRegistration.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(resendOtpForRegistration.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(resendOtpForRegistration.rejected, (state, action) => {
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
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isLoading = false;
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
        // generating otp for pass reset
        builder.addCase(verifyEmailForPassReset.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(verifyEmailForPassReset.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(verifyEmailForPassReset.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // verifying otp for pass reset
        builder.addCase(verifyOtpForPassReset.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(verifyOtpForPassReset.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(verifyOtpForPassReset.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // reset password
        builder.addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // send otp for email change
        builder.addCase(sendOtpForEmailChange.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(sendOtpForEmailChange.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(sendOtpForEmailChange.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // changing user email address
        builder.addCase(changeUserEmail.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(changeUserEmail.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentUser = action.payload;
        });
        builder.addCase(changeUserEmail.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // editing message
        builder.addCase(editMessage.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(editMessage.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(editMessage.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // updating state after deleting message
        builder.addCase(deleteMessageForSingleUser.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(deleteMessageForSingleUser.fulfilled, (state, action) => {
            state.isLoading = false;
            const updatedMessage = action.payload;
            const { _id, roomId } = updatedMessage;
            const updatedRoomMessages = state.roomConversation.messages.filter(message => message._id !== _id);
            const updatedRoomConversation = { ...state.roomConversation, messages: updatedRoomMessages };
            const filteredAllRoomConversations = state.allRoomConversations.filter(conversation => conversation.user.roomId !== roomId);
            const updateRecentConversations = (conversations) => {
                return conversations.map((conversation) => {
                    const { message } = conversation;
                    if (message.roomId === roomId) {
                        if (message._id === _id) {
                            return { ...conversation, message: updatedRoomMessages[updatedRoomMessages.length - 1] };
                        } else {
                            return conversation;
                        };
                    } else {
                        return conversation;
                    };
                });
            };
            state.recentConversations = updateRecentConversations(state.recentConversations);
            state.tempRecentConversations = updateRecentConversations(state.tempRecentConversations);
            state.roomConversation = updatedRoomConversation;
            state.allRoomConversations = [...filteredAllRoomConversations, updatedRoomConversation];
        });
        builder.addCase(deleteMessageForSingleUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // updating state after deleting message for everyone
        builder.addCase(deleteMessageForEveryone.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(deleteMessageForEveryone.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(deleteMessageForEveryone.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
        // removing conversation from state after deleting
        builder.addCase(deleteChat.pending, (state) => {
            state.isLoading = true;
            state.isError = null;
        });
        builder.addCase(deleteChat.fulfilled, (state, action) => {
            const roomId = action.payload;
            state.isLoading = false;
            state.recentConversations = state.recentConversations.filter(conversation => conversation.user.roomId !== roomId);
            state.tempRecentConversations = state.tempRecentConversations.filter(conversation => conversation.user.roomId !== roomId);
            state.roomConversation = null;
            state.allRoomConversations = state.allRoomConversations.filter(conversation => conversation.user.roomId !== roomId);
        });
        builder.addCase(deleteChat.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = action.error.message;
        });
    }
});

export const { setRoomConversation, filterUsersList, filterChatList, setNewChat, updateReceivedConversation, updateUserStatus, updateTypingStatus, updateSeenMessages, updateDeliveredMessages, updateEditedMessage, updateEveryoneDeletedMessage, updateConnectionStatus, updatePendingMessages } = chatSlice.actions;
export default chatSlice.reducer;