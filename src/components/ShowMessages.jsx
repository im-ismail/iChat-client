import React, { useEffect, useRef, useState } from 'react';
import msToTime from '../helper/msToTime';
import { markAsRead } from '../services/socket';

const ShowMessages = ({ roomConversation }) => {

    const [currentRoom, setCurrentRoom] = useState(null);
    const messagesRef = useRef();
    const messageRefs = useRef({});
    const { user, messages } = roomConversation;
    const { _id: otherUserId, roomId } = user;
    let initialDate = '01/01/1970';

    // handling message scroll
    const handleMessageScroll = () => {
        const container = messagesRef.current;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const scrollPosition = container.scrollTop;
        const unreadMessagesIds = [];
        console.log(messagesRef);
        console.log('ch', containerHeight, 'st', scrollPosition, 'sh', container.scrollHeight, 'cch', container.lastChild.clientHeight, container.lastChild.scrollHeight);

        messages.forEach(message => {
            if (!message.read.status && message.sentBy._id === otherUserId) {
                const messageRef = messageRefs.current[message._id];
                if (messageRef) {
                    const messageTop = messageRef.offsetTop;
                    const messageHeight = messageRef.clientHeight;
                    if (messageTop >= scrollPosition && messageTop + messageHeight <= scrollPosition + containerHeight) {
                        unreadMessagesIds.push(message._id);
                    };
                };
            };
        });
        if (unreadMessagesIds.length) {
            markAsRead(unreadMessagesIds, roomId, otherUserId);
        };
    };

    // Scrolling the page to the bottom of the chat for first time and adding listener on message scroll
    useEffect(() => {
        const container = messagesRef.current;
        container.scrollTop = container.scrollHeight - container.clientHeight;
    }, []);

    // Scrolling to the bottom for new chat and for re opened chat it checks if the user was already at the bottom of the chat before the new message arrived and scrolls to the bottom only in that case.
    useEffect(() => {
        const container = messagesRef.current;
        // adding scroll listener to message container with messages dependency to access updated messages inside from handleMessagesScroll
        container.addEventListener('scroll', handleMessageScroll);
        // calling handleMessageScroll function if messages are not scrollable to mark them as read
        if (container.scrollHeight <= container.clientHeight) {
            handleMessageScroll();
        };
        const isScrolledToBottom = container.scrollHeight - container.clientHeight - container.lastChild.clientHeight <= container.scrollTop + 1;
        if (currentRoom && currentRoom !== roomId) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        } else if (isScrolledToBottom) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        };
        setCurrentRoom(roomId);
        // cleaning up event listener whenever messages dependency changes
        return () => {
            container.removeEventListener('scroll', handleMessageScroll);
        };
    }, [messages]);

    return (
        <div className="messages" id='messages' ref={messagesRef}>
            {
                messages.map((conversation, index) => {
                    const { _id: messageId, content, sentBy, delivered, read, createdAt } = conversation;
                    const { _id: senderId } = sentBy;
                    const { result, sendingTime, sendingDate, dayAndDate } = msToTime(createdAt);
                    const fontWeight = !read.status && otherUserId === senderId ? 'bold' : '';

                    const messageElement = <div className='message'>
                        <p className="message-content">{content}</p>
                        <p className='info'>
                            <span className="message-time">{sendingTime}</span>
                            {senderId !== otherUserId && <span>
                                {!delivered.status ? <i className="fa-solid fa-check"></i> : <i style={read.status ? { color: 'rgb(57, 57, 247)' } : null} className="fa-solid fa-check-double"></i>}
                            </span>}
                        </p>
                    </div>

                    if (initialDate !== dayAndDate) {
                        initialDate = dayAndDate;
                        return <div key={index} ref={(ref) => (messageRefs.current[messageId] = ref)}>
                            <div className="show-date">
                                <p>{result === 'today' ? 'Today' : result === 'yesterday' ? 'Yesterday' : dayAndDate}</p>
                            </div>
                            <div style={{ fontWeight }} className={otherUserId === senderId ? 'received' : 'sent'}>
                                {messageElement}
                            </div>
                        </div>
                    } else {
                        return <div style={{ fontWeight }} className={otherUserId === senderId ? 'received' : 'sent'} key={index} ref={(ref) => (messageRefs.current[messageId] = ref)}>
                            {messageElement}
                        </div>
                    }
                })
            }
        </div>
    )
}

export default ShowMessages;