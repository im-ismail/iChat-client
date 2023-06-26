import React, { useEffect, useRef, useState } from 'react';
import msToTime from '../helper/msToTime';
import msToLastSeen from '../helper/msToLastSeen';
import { useDispatch } from 'react-redux';
import { setRoomConversation } from '../features/chats/chatSlice';
import SendMessage from './SendMessage';
import { serverUrl } from '../api/apiEndpoint';

const OldChat = ({ roomConversation, makeItResponsive }) => {

    const [currentRoom, setCurrentRoom] = useState(null);
    const messagesRef = useRef();
    const user = roomConversation?.user ?? {};
    const messages = roomConversation?.messages ?? [];
    const { _id: otherUserId, roomId, name, image, online, lastSeen, typing } = user;
    let initialDate = '01/01/1970';
    const dispatch = useDispatch();

    const navigateBack = () => {
        makeItResponsive();
        dispatch(setRoomConversation(null));
    };
    // Scrolling the page to the bottom of the chat for first time
    useEffect(() => {
        const messages = messagesRef.current;
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    }, []);
    // Scrolling to the bottom whenever a new chat is opened and scrolling to the for new message only if user was on the bottom of chat before sending or receiving message
    useEffect(() => {
        const messages = messagesRef.current;
        const isScrolledToBottom = messages.scrollHeight - messages.clientHeight - messages.lastChild.clientHeight <= messages.scrollTop + 1;
        if (currentRoom && currentRoom !== roomId) {
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;
        } else if (isScrolledToBottom) {
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;
        };
        setCurrentRoom(roomId);
    }, [roomConversation]);

    return (
        <>
            <div className="navigation">
                <span className="go-back" onClick={navigateBack}>🔙</span>
                <div className="chat-partner-info">
                    <img src={`${serverUrl}/${image}`} alt="dp" className="chat-partner-profile-pic" />
                    <div className="info">
                        <h4 className="chat-partner-name">{name}</h4>
                        <p className="last-seen">{typing ? 'typing...' : online ? 'Online' : msToLastSeen(lastSeen)}</p>
                    </div>
                </div>
            </div>
            <div className="chat-screen">
                <div className="messages" id='messages' ref={messagesRef}>
                    {
                        messages.map((conversation, index) => {
                            const { content, time_stamp, sentBy } = conversation;
                            const { _id: senderId } = sentBy;
                            const { result, sendingTime, sendingDate, dayAndDate } = msToTime(time_stamp);

                            if (initialDate !== dayAndDate) {
                                initialDate = dayAndDate;
                                return <div key={index}>
                                    <div className="show-date">
                                        <p>{result === 'today' ? 'Today' : result === 'yesterday' ? 'Yesterday' : dayAndDate}</p>
                                    </div>
                                    <div className={otherUserId === senderId ? 'received' : 'sent'}>
                                        <div className='message'>
                                            <p className="message-content">{content}</p>
                                            <p className="message-time">{sendingTime}</p>
                                        </div>
                                    </div>
                                </div>
                            } else {
                                return <div className={otherUserId === senderId ? 'received' : 'sent'} key={index}>
                                    <div className='message'>
                                        <p className="message-content">{content}</p>
                                        <p className="message-time">{sendingTime}</p>
                                    </div>
                                </div>
                            }
                        })
                    }
                </div>
            </div>
            <SendMessage user={user} />
        </>
    )
}

export default OldChat;