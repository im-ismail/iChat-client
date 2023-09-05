import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { changeUserEmail, sendOtpForEmailChange, updateUser } from '../features/chats/chatSlice';

const Edit = ({ editPageRef, updateType, userId }) => {

    const [inputValue, setInputValue] = useState({
        name: '',
        oldEmail: '',
        newEmail: '',
        oldPassword: '',
        newPassword: '',
        password: '',
        otp: ''
    });
    const { name, oldEmail, newEmail, oldPassword, newPassword, password, otp } = inputValue;
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpGenerated, setIsOtpGenerated] = useState(false);
    const [showResendButton, setShowResendButton] = useState(true);
    const [isOtpRegenerating, setIsOtpRegenerating] = useState(false);
    const [countdown, setCountdown] = useState(120);

    // handling onChange event and setting input value to the state
    const handleChange = (e) => {
        setInputValue({ ...inputValue, [e.target.name]: e.target.value });
    };

    // handling submit event event and updating profile
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (updateType === 'email') {
                if (!isOtpGenerated) {
                    await dispatch(sendOtpForEmailChange({ inputValue, userId })).unwrap();
                    setIsOtpGenerated(true);
                } else {
                    await dispatch(changeUserEmail({ inputValue, userId })).unwrap();
                    setIsOtpGenerated(false);
                    closeEditPage();
                };
            } else {
                await dispatch(updateUser({ inputValue, userId })).unwrap();
                closeEditPage();
            };
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };

    const reGenerateOtp = async () => {
        try {
            setIsOtpRegenerating(true);
            await dispatch(sendOtpForEmailChange({ inputValue, userId })).unwrap();
            setShowResendButton(false);
            // showing timer of 2 min, resend button after 2 min
            const timerId = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown === 0) {
                        clearInterval(timerId);
                        setShowResendButton(true);
                        return 120;
                    } else {
                        return prevCountdown - 1;
                    }
                });
            }, 1000);
        } catch (error) {
            console.log(error);
        } finally {
            setIsOtpRegenerating(false);
        };
    };

    // closing edit page
    const closeEditPage = () => {
        const editPage = editPageRef.current;
        editPage.style.display = 'none';
        setInputValue({
            name: '',
            oldEmail: '',
            newEmail: '',
            oldPassword: '',
            newPassword: '',
            password: '',
            otp: ''
        });
    };

    return (
        <div className="edit-page" ref={editPageRef}>
            <div className='navigation'>
                <span className="go-back" onClick={closeEditPage}>🔙</span>
                <span>{updateType === 'name' ? 'Edit name' : updateType === 'email' ? 'Change email address' : 'Change password'}</span>
            </div>
            <form onSubmit={handleProfileUpdate}>
                {updateType === 'name' && <div className="input">
                    <input type="text" name='name' placeholder='Enter your name' required onChange={handleChange} value={name} />
                </div>}
                {updateType === 'email' && <>
                    <div className="input">
                        <input type="email" name='oldEmail' placeholder='Enter old email address' required onChange={handleChange} value={oldEmail} disabled={isOtpGenerated} />
                    </div>
                    <div className="input">
                        <input type="email" name='newEmail' placeholder='Enter new email address' required onChange={handleChange} value={newEmail} disabled={isOtpGenerated} />
                    </div>
                    {isOtpGenerated && <div className="input">
                        <input type="text" name='otp' placeholder='Enter OTP' required onChange={handleChange} value={otp} />
                    </div>}
                </>}
                {updateType === 'password' && <><div className="input">
                    <input type="password" name='oldPassword' placeholder='Enter old password' minLength={6} required onChange={handleChange} value={oldPassword} />
                </div>
                    <div className="input">
                        <input type="password" name='newPassword' placeholder='Enter new password' minLength={6} required onChange={handleChange} value={newPassword} />
                    </div></>}
                {updateType !== 'password' && !isOtpGenerated && <div className="input">
                    <input type="password" name='password' placeholder='Enter your password' required minLength={6} onChange={handleChange} value={password} />
                </div>}
                <div className="button">
                    <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isOtpGenerated && isLoading ? 'Changing' : updateType === 'email' && isOtpGenerated ? 'Change' : updateType === 'email' && isLoading ? 'Sending otp...' : updateType === 'email' ? 'Send otp' : isLoading ? 'Updating...' : 'Update'}</button>
                </div>
            </form>
            {isOtpGenerated &&
                <div className='resend-otp'>
                    <span>OTP not received yet?</span> {isOtpRegenerating ? <span>Sending...</span> : showResendButton ? <span className='resend' onClick={reGenerateOtp}>Resend OTP</span> : <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>}
                </div>
            }
        </div>
    )
}

export default Edit;