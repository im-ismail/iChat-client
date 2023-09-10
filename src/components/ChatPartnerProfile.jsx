import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { serverUrl } from '../api/apiEndpoint';
import msToLastSeen from '../helper/msToLastSeen';
import { deleteChat } from '../features/chats/chatSlice';

const ChatPartnerProfile = ({ user, profileRef, makeItResponsive }) => {

    const { name, email, image, online, lastSeen, typing, roomId } = user;
    const emailParts = email.split('@');
    const showEmail = emailParts[0].slice(0, Math.floor(emailParts[0].length / 2)) + '*****@' + emailParts[1];

    const deletePopupRef = useRef();
    const dispatch = useDispatch()
    const [isDeleting, setIsDeleting] = useState(false);

    // showing chat partner profile page
    const closeChatPartnerProfile = () => {
        const profile = profileRef.current;
        profile.style.display = 'none';
    };

    const showDeletePopup = () => {
        const deletePopup = deletePopupRef.current;
        deletePopup.style.display = 'block';
    };
    const hideDeletePopup = () => {
        const deletePopup = deletePopupRef.current;
        if (deletePopup) {
            deletePopup.style.display = 'none';
        };
    };

    const handleDeleteChat = async () => {
        setIsDeleting(true);
        try {
            await dispatch(deleteChat(roomId)).unwrap();
            makeItResponsive();
            hideDeletePopup();
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(false);
        };
    };

    return (
        <div className="chat-partner-profile-page" ref={profileRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeChatPartnerProfile}>🔙</span>
                <span><h3>{name}</h3></span>
            </div>
            <div className="profile">
                <div className="profile-pic">
                    <a href={`${serverUrl}/${image}`} target='_blank'><img src={`${serverUrl}/${image}`} alt={name} /></a>
                </div>
                <div className="details">
                    <p>Name: {name}</p>
                    <p>{showEmail}</p>
                    <p className="last-seen">{typing ? 'typing...' : online ? 'Online' : msToLastSeen(lastSeen)}</p>
                </div>
                {roomId && <div className="features">
                    <p onClick={showDeletePopup}>Delete conversation</p>
                </div>}
            </div>
            <div className='delete-popup' ref={deletePopupRef}>
                <p>Are you sure you want to delete this conversation? It cannot be retrieved.</p>
                <div className='buttons'>
                    <button onClick={hideDeletePopup}>Cancel</button>
                    <button className='delete' onClick={handleDeleteChat}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
                </div>
            </div>
        </div>
    )
}

export default ChatPartnerProfile;