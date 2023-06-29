import React, { useEffect, useRef, useState } from 'react';
import msToTime from '../helper/msToTime';

const ShowMessages = ({ roomConversation }) => {

    const [currentRoom, setCurrentRoom] = useState(null);
    const messagesRef = useRef();
    const { user, messages } = roomConversation;
    const { _id: otherUserId, roomId } = user;
    let initialDate = '01/01/1970';

    // Scrolling the page to the bottom of the chat for first time
    useEffect(() => {
        const messages = messagesRef.current;
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    }, []);

    // Scrolling to the bottom for new chat and for re opened chat it checks if the user was already at the bottom of the chat before the new message arrived and scrolls to the bottom only in that case.
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
    )
}

export default ShowMessages;