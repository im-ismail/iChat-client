import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { updateUserDetails } from '../features/chats/chatSlice';

const Edit = ({ editPageRef, updateType, userId }) => {

    const [inputValue, setInputValue] = useState({
        name: '',
        oldNumber: '',
        newNumber: '',
        oldPassword: '',
        newPassword: '',
        password: ''
    });
    const { name, oldNumber, newNumber, oldPassword, newPassword, password } = inputValue;
    const dispatch = useDispatch();
    const [isIdle, setIsIdle] = useState(false);

    // handling onChange event and setting input value to the state
    const handleChange = (e) => {
        setInputValue({ ...inputValue, [e.target.name]: e.target.value });
    };

    // handling submit event event and updating profile
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsIdle(true);
            await dispatch(updateUserDetails({ inputValue, userId })).unwrap();
            closeEditPage();
        } catch (error) {
            console.log(error);
        } finally {
            setIsIdle(false);
        };
    };

    // closing edit page
    const closeEditPage = () => {
        const editPage = editPageRef.current;
        editPage.style.display = 'none';
        setInputValue({
            name: '',
            oldNumber: '',
            newNumber: '',
            oldPassword: '',
            newPassword: '',
            password: ''
        });
    };

    return (
        <div className="edit container" ref={editPageRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeEditPage}>🔙</span>
                <span>{updateType === 'name' ? 'Edit name' : updateType === 'number' ? 'Change number' : 'Change password'}</span>
            </div>
            <form className='login-form' onSubmit={handleProfileUpdate}>
                {updateType === 'name' && <div className="input">
                    <input type="text" name='name' placeholder='Enter your name' required onChange={handleChange} value={name} />
                </div>}
                {updateType === 'number' && <>
                    <div className="input">
                        <input type="number" name='oldNumber' placeholder='Enter old number' required onChange={handleChange} value={oldNumber} />
                    </div>
                    <div className="input">
                        <input type="number" name='newNumber' placeholder='Enter new number' required onChange={handleChange} value={newNumber} />
                    </div>
                </>}
                {updateType === 'password' && <><div className="input">
                    <input type="password" name='oldPassword' placeholder='Enter old password' required onChange={handleChange} value={oldPassword} />
                </div>
                    <div className="input">
                        <input type="password" name='newPassword' placeholder='Enter new password' required onChange={handleChange} value={newPassword} />
                    </div></>}
                {updateType !== 'password' && <div className="input">
                    <input type="password" name='password' placeholder='Enter your password' required onChange={handleChange} value={password} />
                </div>}
                <div className="button">
                    <button type="submit" disabled={isIdle} className={isIdle ? 'disable' : ''}>Save</button>
                </div>
            </form>
        </div>
    )
}

export default Edit;