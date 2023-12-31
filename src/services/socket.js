import { updateDeliveredMessages, updateSeenMessages, updateEditedMessage, updateReceivedConversation, updateTypingStatus, updateUserStatus, updateEveryoneDeletedMessage } from "../features/chats/chatSlice";

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
    socket.on('new-message', (data) => {
        dispatch(updateReceivedConversation(data));
    });
    // receiving updated user details
    socket.on('update-user-status', updatedUser => {
        dispatch(updateUserStatus(updatedUser));
    });
    // receiving typing event
    socket.on('typing', ({ roomId, typingUserId }) => {
        clearTimeout(timeOut);
        dispatch(updateTypingStatus({ roomId, typingUserId, typing: true }));
        timeOut = setTimeout(() => {
            dispatch(updateTypingStatus({ roomId, typingUserId, typing: false }));
        }, 2000);
    });
    // receiving event to mark messages as read
    socket.on('mark-seen', ({ updatedMessages, roomId, otherUserId, unreadMessagesCount }) => {
        dispatch(updateSeenMessages({ updatedMessages, roomId, otherUserId, unreadMessagesCount }));
    });
    // receiving event to mark messages as delivered
    socket.on('mark-delivered', ({ updatedMessages, roomId, otherUserId, unreadMessagesCount }) => {
        dispatch(updateDeliveredMessages({ updatedMessages, roomId, otherUserId, unreadMessagesCount }));
    });
    // receiving event with edited message to update messages
    socket.on('update-edited-message', (editedMessage) => {
        dispatch(updateEditedMessage(editedMessage));
    });
    // receiving event with deleted message to update messages
    socket.on('update-deleted-message', (updatedMessage) => {
        dispatch(updateEveryoneDeletedMessage(updatedMessage));
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
// sending typing alert
const emitTyping = (roomId, typingUserId) => {
    socket.emit('typing', { roomId, typingUserId });
};

export { checkRooms, joinRoom, emitTyping };
export default configureSocket;