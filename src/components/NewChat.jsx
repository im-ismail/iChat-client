import React, { useRef } from 'react';
import { setNewChat } from '../features/chats/chatSlice';
import { useDispatch } from 'react-redux';
import msToLastSeen from '../helper/msToLastSeen';
import SendMessage from './SendMessage';
import { serverUrl } from '../api/apiEndpoint';

const NewChat = ({ newChat, setSubcribedRooms, makeItResponsive }) => {

    const messagesRef = useRef();
    const { name, image, online, lastSeen } = newChat;
    const dispatch = useDispatch();

    const navigateBack = () => {
        makeItResponsive();
        dispatch(setNewChat(null));
    };

    return (
        <>
            <div className="navigation">
                <span className="go-back" onClick={navigateBack}>🔙</span>
                <div className="chat-partner-info">
                    <img src={`${serverUrl}/${image}`} alt="dp" className="chat-partner-profile-pic" />
                    <div className="info">
                        <h4 className="chat-partner-name">{name}</h4>
                        <p className="last-seen">{online ? 'Online' : msToLastSeen(lastSeen)}</p>
                    </div>
                </div>
            </div>
            <div className="chat-screen">
                <div className="messages" id='messages' ref={messagesRef}>
                </div>
            </div>
            <SendMessage user={newChat} setSubcribedRooms={setSubcribedRooms} />
        </>
    )
}

export default NewChat;