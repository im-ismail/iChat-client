import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Edit from './EditPage';
import Delete from './DeletePage';
import { logoutUser } from '../features/chats/chatSlice';
import UpdateProfilePic from './UpdateProfilePic';
import { serverUrl } from '../api/apiEndpoint';

const Profile = ({ profileRef }) => {

    const { _id, name, number, image } = useSelector(state => state.chat.currentUser);
    const [updateType, setUpdateType] = useState(null);
    const editPageRef = useRef();
    const deletePageRef = useRef();
    const updateProfilePicRef = useRef();
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

    return (
        <>
            <div className="profile-page" ref={profileRef}>
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
                        <p>{number}</p>
                    </div>
                </div>
                <hr />
                <p className='list' onClick={() => showEditPage('name')}>Update Name</p>
                <p className='list' onClick={() => showEditPage('password')}>Change Password</p>
                <p className='list' onClick={() => showEditPage('number')}>Change Number</p>
                <p className='list' style={{ color: 'red' }} onClick={showDeletePage}>Delete Account</p>
                <p className='list' style={{ color: 'tomato' }} onClick={handleLogout}>Logout</p>
            </div>
            <Edit editPageRef={editPageRef} updateType={updateType} userId={_id} />
            <Delete deletePageRef={deletePageRef} userId={_id} />
            <UpdateProfilePic updateProfilePicRef={updateProfilePicRef} />
        </>
    )
}

export default Profile;