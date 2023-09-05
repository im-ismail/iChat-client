import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from '../features/chats/chatSlice';

const Login = () => {

    const { isLoggedIn } = useSelector(state => state.chat);
    const [userData, setUserData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(userLogin(userData)).unwrap();
            setUserData({
                email: '',
                password: ''
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <>
            {
                !isLoggedIn &&
                <div className="form-container">
                    <h1 className="heading">Login to your iChat account</h1>
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div className="input">
                            <input id="email" type="email" name="email" placeholder="Email address" required onChange={handleChange} value={userData.email} />
                        </div>
                        <div className="input">
                            <input id="password" type="password" name="password" placeholder="Password" required minLength={6} onChange={handleChange} value={userData.password} />
                        </div>
                        <div className="button">
                            <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isLoading ? 'Logging in...' : 'Log In'}</button>
                        </div>
                    </form>
                    <div className="link">
                        <span>Forgot password?</span> <Link to={'/reset-password'} className="link">Click here</Link>
                    </div>
                    <div className="link">
                        <Link to={'/register'} className="link">Create new account</Link>
                    </div>
                </div>
            }
        </>
    )
}

export default Login;