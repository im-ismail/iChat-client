import React from 'react';
// import '../styles/chatList.css';
import msToTime from '../helper/msToTime';
import { useSelector } from 'react-redux';
import Loading from './Loading';

const ChatList = ({ fetchRoomConversation }) => {

    const { isLoading, isError, recentConversations } = useSelector(state => state.chat);

    return (
        <div className="chat-list">
            <>
                {isLoading && !recentConversations && <Loading />}
                {isError && !recentConversations && <p>Some error occured</p>}
            </>
            {recentConversations && recentConversations.map((conversation, index) => {
                const { user, message } = conversation;
                const { _id: otherUserId, roomId, name, online, lastSeen, typing } = user;
                const { content, time_stamp, sentBy } = message;
                const { _id: senderId } = sentBy;

                const { result, sendingTime } = msToTime(time_stamp);
                const show = content.slice(0, 25);
                const hide = content.slice(25);
                return <div className='list' key={index} onClick={() => fetchRoomConversation(roomId, otherUserId)}>
                    <div>
                        <img src={conversation.image || 'images/dp.jpg'} alt="" className="participant-profile-pic" />
                    </div>
                    <div className="details">
                        <div className="first-line">
                            <h4 className="name">{name}</h4>
                            <p className="date">{result === 'today' ? sendingTime : result === 'yesterday' ? 'Yesterday' : result}</p>
                        </div>
                        <p className="second-line">
                            {
                                typing ? <span className='typing'>typing...</span> : <>
                                    <span>{otherUserId === senderId ? '' : 'You: '}</span>
                                    <span>{hide ? show + '...' : show}</span>
                                </>
                            }
                        </p>
                    </div>
                </div>
            })
            }
        </div>
    )
}

export default ChatList;