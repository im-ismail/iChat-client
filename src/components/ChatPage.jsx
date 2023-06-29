import React from 'react';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import ShowChat from './ShowChat';

const ChatPage = ({ loading, error, setJoinedRooms, chatPageRef, makeItResponsive }) => {

    const { newChat, roomConversation } = useSelector(state => state.chat);

    return (
        <div className="chat-page" ref={chatPageRef}>
            {loading && <Loading />}
            {error && <p>Some error occured: {error}</p>}
            {(newChat || roomConversation) && !loading && !error && (
                <ShowChat
                    newChat={newChat}
                    roomConversation={roomConversation}
                    makeItResponsive={makeItResponsive}
                    setJoinedRooms={setJoinedRooms}
                />
            )}
        </div>
    )
}

export default ChatPage;