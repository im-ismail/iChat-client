import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setNewChat, setRoomConversation } from '../features/chats/chatSlice';
import { serverUrl } from '../api/apiEndpoint';
import msToLastSeen from '../helper/msToLastSeen';
import ChatPartnerProfile from './ChatPartnerProfile';
import SendMessage from './SendMessage';
import ShowMessages from './ShowMessages';

const ShowChat = ({ newChat, roomConversation, makeItResponsive, setJoinedRooms, chatPageRef, currentUser }) => {

    const user = newChat ?? roomConversation.user;
    const { name, image, typing, online, lastSeen } = user;

    const profileRef = useRef();
    const dispatch = useDispatch();

    // closing chatpage
    const navigateBack = () => {
        makeItResponsive();
        dispatch(setRoomConversation(null));
        dispatch(setNewChat(null));
    };

    // showing chat partner profile page
    const showChatPartnerProfile = () => {
        const profile = profileRef.current;
        profile.style.display = 'block';
    };

    return (
        <>
            <div className="navigation">
                <span className="go-back" onClick={navigateBack}>🔙</span>
                <div className="chat-partner-info" onClick={showChatPartnerProfile}>
                    <img src={`${serverUrl}/${image}`} alt="dp" className="chat-partner-profile-pic" />
                    <div className="info">
                        <h4 className="chat-partner-name">{name}</h4>
                        <p className="last-seen">{typing ? 'typing...' : online ? 'Online' : msToLastSeen(lastSeen)}</p>
                    </div>
                </div>
            </div>
            <ChatPartnerProfile user={user} profileRef={profileRef} />
            <div className="messages-container">
                {roomConversation && <ShowMessages roomConversation={roomConversation} chatPageRef={chatPageRef} />}
            </div>
            <SendMessage
                user={user}
                setJoinedRooms={setJoinedRooms}
                currentUser={currentUser}
            />
        </>
    )
}

export default ShowChat;