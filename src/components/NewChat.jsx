import React, { useRef, useState } from 'react';
import { sendMessage, setNewChat } from '../features/chats/chatSlice';
import { useDispatch } from 'react-redux';
import msToLastSeen from '../helper/msToLastSeen';

const NewChat = ({ newChat, setSubcribedRooms, makeItResponsive }) => {
    // const { sendMessage, removeChatPage } = useContext(ChatContext);
    const [message, setMessage] = useState('');
    const messagesRef = useRef();
    const { name, _id, online, lastSeen } = newChat;
    const dispatch = useDispatch();

    // Function for sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message) {
            try {
                const data = await dispatch(sendMessage({ message, otherUserId: _id })).unwrap();
                setMessage('');
                // adding this newly created roomId to subscribedRoom to avoid any conflict
                setSubcribedRooms(prev => prev ? [...prev, data.user.roomId] : [data.user.roomId]);
            } catch (error) {
                console.log(error);
            };
        };
    };

    const navigateBack = () => {
        makeItResponsive();
        dispatch(setNewChat(null));
    };

    return (
        <>
            <div className="navigation">
                <span className="go-back" onClick={navigateBack}>🔙</span>
                <img src="images/dp.jpg" alt="" className="participant-profile-pic" />
                <div className="info">
                    <h4 className="participant-name">{name}</h4>
                    <p className="last-seen">{online ? 'Online' : msToLastSeen(lastSeen)}</p>
                </div>
            </div>
            <div className="chat-screen">
                <div className="messages" id='messages' ref={messagesRef}>
                </div>
            </div>
            <div className="send-message-section">
                <h4 className="name-tag">{name.slice(0, 1)}</h4>
                <form onSubmit={handleSendMessage}>
                    <input type="text" className="input-field" required value={message} onChange={e => setMessage(e.target.value)} />
                    <p className="send-button" onClick={handleSendMessage}>⩥</p>
                </form>
            </div>
        </>
    )
}

export default NewChat;