import React from 'react'
import { serverUrl } from '../api/apiEndpoint';
import msToLastSeen from '../helper/msToLastSeen';

const ChatPartnerProfile = ({ user, profileRef }) => {

    const { name, number, image, online, lastSeen, typing } = user;

    // showing chat partner profile page
    const closeChatPartnerProfile = () => {
        const profile = profileRef.current;
        profile.style.display = 'none';
    };

    return (
        <div className="chat-partner-profile-page" ref={profileRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeChatPartnerProfile}>🔙</span>
                <span><h3>{name}</h3></span>
            </div>
            <div className="profile">
                <div className="profile-pic">
                    <img src={`${serverUrl}/${image}`} alt={name} />
                </div>
                <div className="details">
                    <p>{number}</p>
                    <p className="last-seen">{typing ? 'typing...' : online ? 'Online' : msToLastSeen(lastSeen)}</p>
                </div>
            </div>
        </div>
    )
}

export default ChatPartnerProfile;