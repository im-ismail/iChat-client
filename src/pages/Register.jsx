import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
// import '../styles/login.css';
import { userRegistration } from '../features/chats/chatSlice';

const Register = () => {

    const { isLoggedIn } = useSelector(state => state.chat);
    const [userData, setUserData] = useState({
        name: '',
        number: '',
        dob: '',
        gender: 'male',
        password: ''
    });
    const [isIdle, setIsIdle] = useState(false);
    const { name, number, dob, password } = userData;
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
            await dispatch(userRegistration(userData)).unwrap();
            setUserData({
                name: '',
                number: '',
                dob: '',
                password: ''
            });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
                    <h1 className="heading">Create your iChat account</h1>
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div className="input">
                            <input id="name" type="text" name="name" placeholder="Enter your name" required onChange={handleChange} value={name} />
                        </div>
                        <div className="input">
                            <input id="number" type="number" name="number" placeholder="Mobile number" required onChange={handleChange} value={number} />
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
                            <input id="password" type="password" name="password" placeholder="Password" required onChange={handleChange} value={password} />
                        </div>
                        <div className="button">
                            <button type="submit" disabled={isIdle} className={isIdle ? 'disable' : ''}>Create Account</button>
                        </div>
                    </form>
                    <div className="link">
                        <Link to={'/login'} className="link">Already have an account?</Link>
                    </div>
                </div>
            }
        </>
    )
}

export default Register;