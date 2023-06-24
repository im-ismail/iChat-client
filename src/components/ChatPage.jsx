import React from 'react';
// import '../styles/chatPage.css';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import NewChat from './NewChat';
import OldChat from './OldChat';

const ChatPage = ({ loading, error, setSubcribedRooms, chatPageRef, makeItResponsive }) => {

    const { newChat, roomConversation } = useSelector(state => state.chat);

    return (
        <div className="chat-page" ref={chatPageRef}>
            {loading && <Loading />}
            {error && <p>Some error occured: {error}</p>}
            {newChat && !loading && !error ? <NewChat newChat={newChat} setSubcribedRooms={setSubcribedRooms} makeItResponsive={makeItResponsive} /> : roomConversation && !loading && !error ? <OldChat roomConversation={roomConversation} makeItResponsive={makeItResponsive} /> : null}
        </div>
    )
}

export default ChatPage;