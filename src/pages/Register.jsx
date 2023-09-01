import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
// import '../styles/login.css';
import { completeRegistration, resendOtpForRegistration, userRegistration } from '../features/chats/chatSlice';

const Register = () => {

    const { isLoggedIn } = useSelector(state => state.chat);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        dob: '',
        gender: 'male',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpGenerated, setIsOtpGenerated] = useState(false);
    const [otp, setOtp] = useState();
    const [showResendButton, setShowResendButton] = useState(true);
    const [isOtpRegenerating, setIsOtpRegenerating] = useState(false);
    const [countdown, setCountdown] = useState(120);
    const { name, email, dob, password } = userData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        };
    }, [isLoggedIn]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleUserRegistration = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(userRegistration(userData)).unwrap();
            setIsOtpGenerated(true);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(completeRegistration({ ...userData, otp })).unwrap();
            setUserData({
                name: '',
                email: '',
                dob: '',
                password: ''
            });
            setOtp('');
            setTimeout(() => {
                setIsOtpGenerated(false);
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };

    const reGenerateOtp = async () => {
        try {
            setIsOtpRegenerating(true);
            await dispatch(resendOtpForRegistration(userData)).unwrap();
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
                    <h1 className="heading">Create your iChat account</h1>
                    {!isOtpGenerated && <><form id="login-form" onSubmit={handleUserRegistration}>
                        <div className="input">
                            <input id="name" type="text" name="name" placeholder="Enter your name" required minLength={3} onChange={handleChange} value={name} />
                        </div>
                        <div className="input">
                            <input id="email" type="email" name="email" placeholder="Email address" required onChange={handleChange} value={email} />
                        </div>
                        <div className="input">
                            <input id="dob" type="text" name="dob" placeholder="Date of birth" required onChange={handleChange} value={dob} />
                        </div>
                        <div className="input">
                            <label htmlFor="gender">Gender : </label>
                            <select name="gender" id="gender" required onChange={handleChange}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="input">
                            <input id="password" type="password" name="password" placeholder="Password" required minLength={6} onChange={handleChange} value={password} />
                        </div>
                        <div className="button">
                            <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isLoading ? 'Sending otp...' : 'Create Account'}</button>
                        </div>
                    </form>
                        <div className="link">
                            <Link to={'/login'} className="link">Already have an account?</Link>
                        </div></>
                    }
                    {isOtpGenerated && <><form id="login-form" onSubmit={handleOtpSubmit}>
                        <p>Please enter the OTP sent to your email address to complete registration process.</p>
                        <div className="input">
                            <input id="otp" type="number" name="otp" placeholder="Enter OTP" required value={otp} onChange={e => setOtp(e.target.value)} />
                        </div>
                        <div className="button">
                            <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isLoading ? 'Verifying...' : 'Verify'}</button>
                        </div>
                    </form>
                        <div className='resend-otp'><span>OTP not received yet?</span> {isOtpRegenerating ? <span>Sending...</span> : showResendButton ? <span className='resend' onClick={reGenerateOtp}>Resend OTP</span> : <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>}</div>
                    </>
                    }
                </div>
            }
        </>
    )
}

export default Register;