import React, { useRef } from 'react';
import { setNewChat } from '../features/chats/chatSlice';
import { useDispatch } from 'react-redux';
import msToLastSeen from '../helper/msToLastSeen';
import SendMessage from './SendMessage';

const NewChat = ({ newChat, setSubcribedRooms, makeItResponsive }) => {

    const messagesRef = useRef();
    const { name, online, lastSeen } = newChat;
    const dispatch = useDispatch();

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
            <SendMessage user={newChat} setSubcribedRooms={setSubcribedRooms} />
        </>
    )
}

export default NewChat;