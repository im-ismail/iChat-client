import React, { useEffect, useRef, useState } from 'react';
import msToTime from '../helper/msToTime';
import msToLastSeen from '../helper/msToLastSeen';
import { useDispatch } from 'react-redux';
import { sendMessage, setRoomConversation } from '../features/chats/chatSlice';
import { emitTyping } from '../services/socket';

const OldChat = ({ roomConversation, makeItResponsive }) => {

    const [message, setMessage] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const messagesRef = useRef();
    const user = roomConversation?.user ?? {};
    const messages = roomConversation?.messages ?? [];
    const { _id: otherUserId, roomId, name, online, lastSeen, typing } = user;
    let initialDate = '01/01/1970';
    const dispatch = useDispatch();

    // function for handling change event
    const handleChange = (e) => {
        setMessage(e.target.value);
        emitTyping(roomId);
    };
    // Function for sending message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message) {
            dispatch(sendMessage({ message, roomId, otherUserId }));
            setMessage('');
        };
    };

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
                <img src="images/dp.jpg" alt="" className="participant-profile-pic" />
                <div className="info">
                    <h4 className="participant-name">{name}</h4>
                    <p className="last-seen">{typing ? 'typing...' : online ? 'Online' : msToLastSeen(lastSeen)}</p>
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
            <div className="send-message-section">
                <h4 className="name-tag">{name.slice(0, 1)}</h4>
                <form onSubmit={handleSendMessage}>
                    <input type="text" className="input-field" required value={message} onChange={handleChange} />
                    <p className="send-button" onClick={handleSendMessage}>⩥</p>
                </form>
            </div>
        </>
    )
}

export default OldChat;