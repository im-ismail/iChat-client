import { markMessagesAsDelivered, markMessagesAsRead, updateReceivedConversation, updateTypingStatus, updateUserStatus } from "../features/chats/chatSlice";

let socket = null;
let dispatch = null;
let timeOut;

// Initialising socket for the first time and emitting user identity when connected
const configureSocket = (socketInstance, userId, useDispatch) => {
    socket = socketInstance;
    dispatch = useDispatch;
    // Emit the user's identity when they log in
    socket.on('connect', () => {
        socket.emit('identity', userId);
        console.log(`⚡: ${socket.id} connected`);
    });
    // receiving messages
    socket.on('new-message', (conversation) => {
        dispatch(updateReceivedConversation(conversation));
    });
    // receiving updated user details
    socket.on('update-user-status', updatedUser => {
        dispatch(updateUserStatus(updatedUser));
    });
    // receiving typing event
    socket.on('typing', (roomId) => {
        clearTimeout(timeOut);
        dispatch(updateTypingStatus({ roomId, typing: true }));
        timeOut = setTimeout(() => {
            dispatch(updateTypingStatus({ roomId, typing: false }));
        }, 2000);
    });
    // receiving event to mark messages as read
    socket.on('mark-read', ({ updatedMessages, roomId, otherUserId, unreadMessagesCount }) => {
        dispatch(markMessagesAsRead({ updatedMessages, roomId, otherUserId, unreadMessagesCount }));
    });

    socket.on('mark-delivered', ({ updatedMessages, roomId, otherUserId, unreadMessagesCount }) => {
        dispatch(markMessagesAsDelivered({ updatedMessages, roomId, otherUserId, unreadMessagesCount }));
    });
};
// This will be called for the first time when user login and will check for available room to connect where other user is already on that room
const checkRooms = (rooms) => {
    socket.emit('check-rooms', rooms);
};
// For joining in a particular room
const joinRoom = (roomId, otherUserId) => {
    socket.emit('join-room', { roomId, otherUserId });
};
// For sending message
const emitMessage = (message) => {
    socket.emit('new-message', message, (response) => {
        console.log('callback', response);
    });
};
// sending typing alert
const emitTyping = (roomId) => {
    socket.emit('typing', roomId);
};
// emitting event to mark messages as read
const markAsRead = (ids, roomId, otherUserId) => {
    socket.emit('mark-read', { ids, roomId, otherUserId });
};

// emitting event to mark messages as delivered
const markAsDelivered = (roomId, otherUserId) => {
    socket.emit('mark-delivered', { roomId, otherUserId });
};

export { checkRooms, joinRoom, emitMessage, emitTyping, markAsRead, markAsDelivered };
export default configureSocket;