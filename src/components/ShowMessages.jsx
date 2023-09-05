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

    // handling message scroll to mark them as read
    const handleMessageScroll = () => {
        const container = messagesRef.current;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const scrollPosition = container.scrollTop;
        const unreadMessagesIds = [];

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

    // setting scroll behaviour of chat page
    useEffect(() => {
        const container = messagesRef.current;
        // adding scroll listener to message container with messages dependency to access updated messages inside from handleMessagesScroll
        container.addEventListener('scroll', handleMessageScroll);
        // calling handleMessageScroll function if messages are not scrollable to mark them as read
        if (container.scrollHeight <= container.clientHeight) {
            handleMessageScroll();
        };

        // finding last mesage from messages array
        const lastMessage = messages[messages.length - 1];
        // checking if user already scrolled to bottom before arriving new message
        const isScrolledToBottom = container.scrollHeight - container.clientHeight - container.lastChild.clientHeight <= container.scrollTop + 1;
        // scrolling to bottom incase of isScrolledToBottom is true or if last message was sent by user
        if (isScrolledToBottom || lastMessage.sentBy._id !== otherUserId) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        } else {
            // scrolling to bottom if height of unreadMessages not more than half of container clientHeight otherwise scrolling accordingly
            const unreadMessages = messages.filter(message => {
                return !message.read.status && message.sentBy._id === otherUserId;
            });
            let unreadMessagesHeight = 0;
            if (unreadMessages.length) {
                unreadMessages.forEach(message => {
                    const messageRef = messageRefs.current[message._id];
                    unreadMessagesHeight += messageRef.clientHeight;
                });
            };
            const containerHeight = container.clientHeight;
            if (unreadMessagesHeight > containerHeight / 2 && (!currentRoom || currentRoom !== roomId)) {
                container.scrollTop = container.scrollHeight - unreadMessagesHeight - (containerHeight / 2);
            } else if (!currentRoom || currentRoom !== roomId) {
                container.scrollTop = container.scrollHeight - container.clientHeight;
            };
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
                                {!delivered.status ? <i className="fa-solid fa-check"></i> : <i style={read.status ? { color: 'rgb(0, 0, 255)' } : null} className="fa-solid fa-check-double"></i>}
                            </span>}
                        </p>
                    </div>

                    if (initialDate !== dayAndDate) {
                        initialDate = dayAndDate;
                        return <div key={index} ref={(ref) => (messageRefs.current[messageId] = ref)} className='first-message'>
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