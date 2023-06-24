import { updateReceivedConversation, updateTypingStatus, updateUserStatus } from "../features/chats/chatSlice";

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
    socket.on('new-message', (conversation, callback) => {
        callback({ message: 'message received successfully' });
        dispatch(updateReceivedConversation(conversation));
    });
    // receiving updated user details
    socket.on('update-user-status', updatedUser => {
        dispatch(updateUserStatus(updatedUser));
    });
    // receiving typing event
    socket.on('typing', (roomId, callback) => {
        callback('done')
        clearTimeout(timeOut);
        dispatch(updateTypingStatus({ roomId, typing: true }));
        timeOut = setTimeout(() => {
            dispatch(updateTypingStatus({ roomId, typing: false }));
        }, 2000);
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

export { checkRooms, joinRoom, emitMessage, emitTyping };
export default configureSocket;