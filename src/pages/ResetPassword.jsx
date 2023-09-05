import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, verifyEmailForPassReset, verifyOtpForPassReset } from '../features/chats/chatSlice';

const ResetPassword = () => {
    const { isLoggedIn } = useSelector(state => state.chat);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCPassword] = useState('');
    const [isOtpGenerated, setIsOtpGenerated] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showResendButton, setShowResendButton] = useState(true);
    const [isOtpRegenerating, setIsOtpRegenerating] = useState(false);
    const [countdown, setCountdown] = useState(120);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        };
    }, [isLoggedIn]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (!isOtpGenerated && !isVerified) {
                await dispatch(verifyEmailForPassReset({ email })).unwrap();
                setIsOtpGenerated(true);
            } else if (isOtpGenerated && !isVerified) {
                await dispatch(verifyOtpForPassReset({ email, otp })).unwrap();
                setIsVerified(true);
            } else {
                await dispatch(resetPassword({ email, password, cPassword })).unwrap();
                setTimeout(() => {
                    setEmail('');
                    setOtp('');
                    setPassword('');
                    setCPassword('');
                    setIsOtpGenerated(false);
                    setIsVerified(false);
                    navigate('/login');
                }, 2000);
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
            await dispatch(verifyEmailForPassReset(email)).unwrap();
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

    return (
        <>
            {
                !isLoggedIn &&
                <div className="form-container">
                    <h1 className="heading">Reset password</h1>
                    <form id="login-form" onSubmit={handleResetPassword}>
                        <p>Please enter the email address associated with your account.</p>
                        <div className="input">
                            <input id="email" type="email" name="email" placeholder="Email address" required onChange={e => setEmail(e.target.value)} value={email} disabled={isOtpGenerated} />
                        </div>
                        {isOtpGenerated && !isVerified && <>
                            <p>Please enter the OTP sent to your email address to reset your password.</p>
                            <div className="input">
                                <input id="otp" type="number" name="otp" placeholder="Enter OTP" required value={otp} onChange={e => setOtp(e.target.value)} />
                            </div>
                        </>}
                        {isVerified && <>
                            <div className="input">
                                <input id="password" type="password" name="password" placeholder="Enter new password" required minLength={6} onChange={e => setPassword(e.target.value)} value={password} />
                            </div>
                            <div className="input">
                                <input id="cPassword" type="password" name="cPassword" placeholder="Confirm new password" required minLength={6} onChange={e => setCPassword(e.target.value)} value={cPassword} />
                            </div>
                        </>}
                        <div className="button">
                            <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isVerified && isLoading ? 'Changing password...' : isVerified ? 'Change Password' : isOtpGenerated && isLoading ? 'Verifying...' : isOtpGenerated ? 'Verify' : isLoading ? 'Sending otp...' : 'Send otp'}</button>
                        </div>
                    </form>
                    {isOtpGenerated && !isVerified &&
                        <div className='resend-otp'>
                            <span>OTP not received yet?</span> {isOtpRegenerating ? <span>Sending...</span> : showResendButton ? <span className='resend' onClick={reGenerateOtp}>Resend OTP</span> : <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>}
                        </div>
                    }
                    <div className="link">
                        <Link to={'/login'} className="link">Enter password to login</Link>
                    </div>
                </div>
            }
        </>
    )
}

export default ResetPassword