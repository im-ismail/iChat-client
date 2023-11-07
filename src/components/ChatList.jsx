import React, { useEffect } from 'react';
import '../styles/chatList.css';
import msToTime from '../helper/msToTime';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import { serverUrl } from '../api/apiEndpoint';
import { markMessagesAsDelivered } from '../features/chats/chatSlice';

const ChatList = ({ fetchRoomConversation, showUserList }) => {

    const { isLoading, isError, recentConversations, pendingMessages } = useSelector(state => state.chat);

    useEffect(() => {
        if (recentConversations?.length) {
            recentConversations.forEach(conversation => {
                const { user, message } = conversation;
                const { _id, roomId } = user;
                const { sentBy, delivered } = message;
                if (_id === sentBy._id && !delivered.status) {
                    markMessagesAsDelivered(roomId, _id);
                };
            });
        };
    }, [recentConversations]);

    return (
        <div className="chat-list">
            <>
                {isLoading && !recentConversations && <Loading />}
                {isError && !recentConversations && <p>Some error occured</p>}
            </>
            {recentConversations && recentConversations.map((conversation, index) => {
                const { user, message } = conversation;

                const matchedPendingMessages = pendingMessages.filter(element => element.roomId === user.roomId);
                const matchedPendingMessage = matchedPendingMessages[matchedPendingMessages.length - 1];
                const successMessageTime = new Date(message.createdAt);
                const pendingMessageTime = new Date(matchedPendingMessage?.timeStamp);

                if (matchedPendingMessage && pendingMessageTime > successMessageTime) {
                    const { content, timeStamp, roomId: pendingMessageRoomId, receiver } = matchedPendingMessage;
                    const { name, image, online, typing } = user;
                    const { unreadMessagesCount } = message;
                    const { result, sendingTime } = msToTime(timeStamp);

                    return <div className='list' key={index} onClick={() => fetchRoomConversation(pendingMessageRoomId, receiver)}>
                        <div>
                            <img src={`${serverUrl}/${image}`} alt="dp" className="chat-partner-profile-pic" />
                        </div>
                        <div className="details">
                            <div className="first-line">
                                <h4 className="chat-partner-name">{name} {online && <i className="fa-solid fa-circle"></i>}</h4>
                                <p className="date">{result === 'today' ? sendingTime : result === 'yesterday' ? 'Yesterday' : result}</p>
                            </div>
                            <div className="second-line">
                                <p className='message-info'>
                                    {typing ? <span className='typing'>typing...</span> : <>
                                        <span><i className="fa-regular fa-clock"></i></span>
                                        <span className='text'>
                                            {content}
                                        </span>
                                    </>}
                                </p>
                                {unreadMessagesCount > 0 && <p className='unread-messages-count'>{unreadMessagesCount < 99 ? unreadMessagesCount : 99}</p>}
                            </div>
                        </div>
                    </div>
                } else {
                    const { user, message } = conversation;
                    const { _id: otherUserId, roomId, name, image, online, typing } = user;
                    const { content, sentBy, delivered, read, unreadMessagesCount, deletedForEveryone, createdAt } = message;
                    const { _id: senderId } = sentBy;

                    const { result, sendingTime } = msToTime(createdAt);
                    const fontWeight = !read.status && otherUserId === senderId ? '500' : '';

                    return <div className='list' key={index} onClick={() => fetchRoomConversation(roomId, otherUserId)}>
                        <div>
                            <img src={`${serverUrl}/${image}`} alt="dp" className="chat-partner-profile-pic" />

                        </div>
                        <div className="details">
                            <div className="first-line">
                                <h4 className="chat-partner-name">{name} {online && <i className="fa-solid fa-circle"></i>}</h4>
                                <p className="date">{result === 'today' ? sendingTime : result === 'yesterday' ? 'Yesterday' : result}</p>
                            </div>
                            <div className="second-line">
                                <p className='message-info'>
                                    {typing ? <span className='typing'>typing...</span> : <>
                                        {senderId !== otherUserId && !deletedForEveryone && <span>
                                            {!delivered.status ? <i className="fa-solid fa-check"></i> : <i style={read.status ? { color: 'rgb(57, 57, 247)' } : null} className="fa-solid fa-check-double"></i>}
                                        </span>}
                                        {deletedForEveryone && senderId === otherUserId ?
                                            <span className='text'>
                                                <i className="fa-solid fa-ban"></i> <i>This message was deleted</i>
                                            </span> : deletedForEveryone ? <span className='text'>
                                                <i className="fa-solid fa-ban"></i> <i>You deleted this message</i>
                                            </span> : <span className='text' style={{ fontWeight }}>
                                                {content}
                                            </span>
                                        }
                                    </>}
                                </p>
                                {unreadMessagesCount > 0 && <p className='unread-messages-count'>{unreadMessagesCount < 99 ? unreadMessagesCount : 99}</p>}
                            </div>
                        </div>
                    </div>
                }
            })
            }
            {!recentConversations?.length && <div className='empty-container'>
                <h3>No chat found...</h3>
                <p>Start a new chat by clicking the message button "<i className="fa-brands fa-rocketchat"></i>" below.</p>
            </div>
            }
            <i className="fa-brands fa-rocketchat msg-icon" onClick={showUserList}></i>
        </div>
    )
}

export default ChatList;