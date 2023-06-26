import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { updateProfilePicture } from '../features/chats/chatSlice';

const UpdateProfilePic = ({ updateProfilePicRef }) => {

    const [selectedImage, setSelectedImage] = useState(null);
    const [isIdle, setIsIdle] = useState(false);
    const dispatch = useDispatch();

    // storing image to state from input field
    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]);
    };

    // sending photo for profile picture update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsIdle(true);
            await dispatch(updateProfilePicture(selectedImage)).unwrap();
            closeUpdateProfilePicPage();
        } catch (error) {
            console.log(error);
        } finally {
            setIsIdle(false);
        };
    };

    // closing page
    const closeUpdateProfilePicPage = () => {
        const editPage = updateProfilePicRef.current;
        editPage.style.display = 'none';
    };

    return (
        <div className='profile-pic-update-page' ref={updateProfilePicRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeUpdateProfilePicPage}>🔙</span>
                <span>Update your profile picture</span>
            </div>
            <form className='edit-form' encType='multipart/form-data' onSubmit={handleSubmit}>
                <div className="input">
                    <input type="file" accept="image/*" name='profilePicture' required onChange={handleImageChange} />
                </div>
                <div className="button">
                    <button type="submit" disabled={isIdle} className={isIdle ? 'disable' : ''}>Upload</button>
                </div>
            </form>
        </div>
    )
}

export default UpdateProfilePic;