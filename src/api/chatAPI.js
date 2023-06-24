const chatAPI = 'http://localhost:5000/room';

const createRoom = `${chatAPI}/initiate`;
const sendMsg = `${chatAPI}`;
const recentConversations = `${chatAPI}`;
const roomConversation = `${chatAPI}`;

module.exports = { createRoom, sendMsg, recentConversations, roomConversation };