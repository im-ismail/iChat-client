import React, { useEffect } from 'react';
import msToTime from '../helper/msToTime';
import { useSelector } from 'react-redux';
import Loading from './Loading';
import { serverUrl } from '../api/apiEndpoint';
import { markAsDelivered } from '../services/socket';

const ChatList = ({ fetchRoomConversation, showUserList }) => {

    const { isLoading, isError, recentConversations } = useSelector(state => state.chat);

    useEffect(() => {
        if (recentConversations?.length) {
            recentConversations.forEach(conversation => {
                const { user, message } = conversation;
                const { _id, roomId } = user;
                const { sentBy, delivered } = message;
                if (_id === sentBy._id && !delivered.status) {
                    markAsDelivered(roomId, _id);
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
                const { _id: otherUserId, roomId, name, image, online, typing } = user;
                const { content, sentBy, delivered, read, unreadMessagesCount, createdAt } = message;
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
                                    {senderId !== otherUserId && <span>
                                        {!delivered.status ? <i className="fa-solid fa-check"></i> : <i style={read.status ? { color: 'rgb(57, 57, 247)' } : null} className="fa-solid fa-check-double"></i>}
                                    </span>}
                                    <span style={{ fontWeight }}>{content.length > 25 ? content.slice(0, 25) + '...' : content}</span>
                                </>}
                            </p>
                            {unreadMessagesCount > 0 && <p className='unread-messages-count'>{unreadMessagesCount}</p>}
                        </div>
                    </div>
                </div>
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