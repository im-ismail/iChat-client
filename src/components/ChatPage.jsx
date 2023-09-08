import React from 'react';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import ShowChat from './ShowChat';

const ChatPage = ({ isLoading, error, setJoinedRooms, chatPageRef, makeItResponsive }) => {

    const { newChat, roomConversation, currentUser } = useSelector(state => state.chat);

    return (
        <div className="chat-page" ref={chatPageRef}>
            {isLoading && <Loading />}
            {error && <p>Some error occured: {error}</p>}
            {(newChat || roomConversation) && !isLoading && !error && (
                <ShowChat
                    newChat={newChat}
                    roomConversation={roomConversation}
                    makeItResponsive={makeItResponsive}
                    setJoinedRooms={setJoinedRooms}
                    chatPageRef={chatPageRef}
                    currentUser={currentUser}
                />
            )}
        </div>
    )
}

export default ChatPage;