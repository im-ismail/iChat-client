import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from '../features/chats/chatSlice';

const Login = () => {

    const { isLoggedIn } = useSelector(state => state.chat);
    const [userData, setUserData] = useState({
        number: '',
        password: ''
    });
    const [isIdle, setIsIdle] = useState(false);
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
            setIsIdle(true);
            await dispatch(userLogin(userData)).unwrap();
            setUserData({
                number: '',
                password: ''
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsIdle(false);
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
                            <input id="number" type="number" name="number" placeholder="Mobile number" required onChange={handleChange} value={userData.number} />
                        </div>
                        <div className="input">
                            <input id="password" type="password" name="password" placeholder="Password" required onChange={handleChange} value={userData.password} />
                        </div>
                        <div className="button">
                            <button type="submit" disabled={isIdle} className={isIdle ? 'disable' : ''}>Log In</button>
                        </div>
                    </form>
                    <div className="link">
                        <Link to={'/register'} className="link">Create new account</Link>
                    </div>
                </div>
            }
        </>
    )
}

export default Login;