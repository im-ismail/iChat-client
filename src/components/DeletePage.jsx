import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { deleteUserAccount } from '../features/chats/chatSlice';

const Delete = ({ deletePageRef, userId }) => {

    const [inputValue, setInputValue] = useState({
        number: '',
        password: ''
    });
    const { number, password } = inputValue;
    const dispatch = useDispatch();
    const [isIdle, setIsIdle] = useState(false);

    // handling onChange event and setting input value to the state
    const handleChange = (e) => {
        setInputValue({ ...inputValue, [e.target.name]: e.target.value });
    };

    // handling submit event for deleting account
    const deleteAccount = async (e) => {
        e.preventDefault();
        try {
            setIsIdle(true);
            await dispatch(deleteUserAccount({ inputValue, userId })).unwrap();
        } catch (error) {
            console.log(error);
        } finally {
            setIsIdle(false);
        };
    };

    // closing delete page
    const closeDeletePage = () => {
        const deletePage = deletePageRef.current;
        deletePage.style.display = 'none';
        setInputValue({
            number: '',
            password: ''
        });
    };

    return (
        <div className="delete-page" ref={deletePageRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeDeletePage}>🔙</span>
                <span>Delete Account</span>
            </div>
            <form className='login-form' onSubmit={deleteAccount}>
                <div className="input">
                    <input type="number" name='number' placeholder='Enter your number' required onChange={handleChange} value={number} />
                </div>
                <div className="input">
                    <input type="password" name='password' placeholder='Enter your password' required onChange={handleChange} value={password} />
                </div>
                <div className="button">
                    <button type="submit" disabled={isIdle} className={isIdle ? 'disable' : ''}>Delete Account</button>
                </div>
            </form>
        </div>
    )
}

export default Delete;