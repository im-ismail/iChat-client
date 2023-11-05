import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/profile.css';
import Edit from './EditPage';
import Delete from './DeletePage';
import { logoutUser } from '../features/chats/chatSlice';
import UpdateProfilePic from './UpdateProfilePic';
import { serverUrl } from '../api/apiEndpoint';

const Profile = ({ profileRef }) => {

    const { _id, name, email, image } = useSelector(state => state.chat.currentUser);
    const [updateType, setUpdateType] = useState(null);
    const editPageRef = useRef();
    const deletePageRef = useRef();
    const updateProfilePicRef = useRef();
    const logoutPopupRef = useRef();
    const logoutButtonRef = useRef();
    const dispatch = useDispatch();

    // logging out user
    const handleLogout = () => {
        dispatch(logoutUser());
    };
    // closing profile page
    const closeProfilePage = () => {
        const profile = profileRef.current;
        profile.style.display = 'none';
    };

    // handling click event for updating user details
    const showEditPage = (value) => {
        const editPage = editPageRef.current;
        setUpdateType(value);
        editPage.style.display = 'block';
    };
    // handling click event for updating user details
    const showDeletePage = () => {
        const deletePage = deletePageRef.current;
        deletePage.style.display = 'block';
    };
    // handling click event for updating profile picture
    const showProfilePicUpdatePage = () => {
        const updateProfilePicPage = updateProfilePicRef.current;
        updateProfilePicPage.style.display = 'block';
    };

    const showLogoutPopup = () => {
        logoutPopupRef.current.style.display = 'block'
    };

    const handleOutsideClick = (e) => {
        // if click event occurs outside popal modal, modal will close
        const logoutPopup = logoutPopupRef.current;
        if (!logoutPopup.contains(e.target) && !logoutButtonRef.current.contains(e.target) && logoutPopup.style.display === 'block') {
            logoutPopup.style.display = 'none'
        };
    };

    return (
        <>
            <div className="profile-page" ref={profileRef} onClick={handleOutsideClick}>
                <div className='navigation'>
                    <span className="go-back" onClick={closeProfilePage}>🔙</span>
                    <span>Settings</span>
                </div>
                <div className='user-profile'>
                    <div className='profile-pic' onClick={showProfilePicUpdatePage}>
                        <img src={`${serverUrl}/${image}`} alt="dp" />
                        <i className="fa-regular fa-pen-to-square edit-pen"></i>
                    </div>
                    <div>
                        <h3>{name}</h3>
                        <p>{email}</p>
                    </div>
                </div>
                <hr />
                <p className='menu-item clickable' onClick={() => showEditPage('name')}>Update Name</p>
                <p className='menu-item clickable' onClick={() => showEditPage('password')}>Change Password</p>
                <p className='menu-item clickable' onClick={() => showEditPage('email')}>Change Email</p>
                <p className='menu-item clickable' style={{ color: 'red' }} onClick={showDeletePage}>Delete Account</p>
                <p className='menu-item clickable' style={{ color: 'tomato' }} onClick={showLogoutPopup} ref={logoutButtonRef}>Logout</p>
            </div>
            <Edit editPageRef={editPageRef} updateType={updateType} userId={_id} />
            <Delete deletePageRef={deletePageRef} userId={_id} />
            <UpdateProfilePic updateProfilePicRef={updateProfilePicRef} />

            <div className='logout-popup' ref={logoutPopupRef}>
                <p>Are you sure you want to logout?</p>
                <div className='buttons'>
                    <button onClick={() => logoutPopupRef.current.style.display = 'none'}>Cancel</button>
                    <button className='logout' onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </>
    )
}

export default Profile;