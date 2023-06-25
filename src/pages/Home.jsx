import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
// import '../styles/home.css';
import UserList from '../components/UserList';
import { filterChatList, getRecentConversations, getUsers, getConversationByRoomId, setRoomConversation, setNewChat } from '../features/chats/chatSlice';
import ChatList from '../components/ChatList';
import ChatPage from '../components/ChatPage';
import { joinRoom } from '../services/socket';
import Profile from '../components/Profile';

const Home = () => {

    const { isLoggedIn, currentUser, roomConversation, allRoomConversations, newChat } = useSelector(state => state.chat);
    const navigate = useNavigate();
    const userListRef = useRef();
    const profileRef = useRef();
    const mainPageRef = useRef();
    const chatPageRef = useRef();
    const dispatch = useDispatch()
    const [subscribedRooms, setSubcribedRooms] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Showing all user list
    const showUserList = () => {
        dispatch(getUsers());
        const userRef = userListRef.current;
        userRef.style.display = 'flex';
        userRef.style.flexDirection = 'column';
    };

    // showing profile page
    const showProfilePage = () => {
        const profile = profileRef.current;
        profile.style.display = 'block';
    };

    // Search for a particular chat from list
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        dispatch(filterChatList(inputValue));
    };

    // making website responsive for small deivces
    const makeItResponsive = () => {
        const smallScreen = window.matchMedia('(max-width:600px)');
        const mainPage = mainPageRef.current;
        const chatPage = chatPageRef.current;
        const mainPageStyle = window.getComputedStyle(mainPage);
        const chatPageStyle = window.getComputedStyle(chatPage);
        if (smallScreen.matches) {
            if (chatPageStyle.display === 'none') {
                chatPage.style.display = 'block';
                mainPage.style.display = 'none';
            } else {
                mainPage.style.display = 'flex';
                chatPage.style.display = 'none';
            };
        } else {
            mainPage.style.display = 'flex';
            chatPage.style.display = 'block';
        };
    };

    // next two function will be used in ChatList and UserList
    // Returning room conversation if it is already in state otherwise calling the API
    const checkRoomConversation = async (roomId) => {
        if (allRoomConversations.length) {
            if (roomConversation && roomConversation.user.roomId === roomId) {
                return;
            };
            const matchedConversation = allRoomConversations.filter((conversation) => {
                return conversation.user.roomId === roomId;
            })[0];
            if (matchedConversation) {
                return dispatch(setRoomConversation(matchedConversation));
            };
        };
        try {
            error && setError(null);
            setLoading(true);
            await dispatch(getConversationByRoomId(roomId)).unwrap();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        };
    };

    // Fetching room conversation, joining room and preventing user from trying to join same room multiple time
    const fetchRoomConversation = (roomId, otherUserId) => {
        makeItResponsive();
        if (newChat) {
            dispatch(setNewChat(null));
        };
        checkRoomConversation(roomId);
        // Preventing user from joining the same room multiple time
        if (subscribedRooms) {
            const existingRoom = subscribedRooms.filter((room) => {
                return room === roomId;
            })[0];
            if (!existingRoom) {
                joinRoom(roomId, otherUserId);
                setSubcribedRooms([...subscribedRooms, roomId]);
            };
        } else {
            joinRoom(roomId, otherUserId);
            setSubcribedRooms([roomId]);
        };
    };

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getRecentConversations());
        } else {
            navigate('/login');
        };
    }, [isLoggedIn]);

    return (
        <div className="app">
            <div className="main-page" ref={mainPageRef}>
                <div className="user-profile">
                    <div className="user-profile-details">
                        <div className="user-profile-pic">
                            <img src="images/profile.jpg" alt="" onClick={showProfilePage} />
                        </div>
                        {currentUser && <h3 className='name'>{currentUser.name}</h3>}
                    </div>
                    <div className="icons">
                        <i className="fa-brands fa-rocketchat" onClick={showUserList}></i>
                        <i className="fa-solid fa-ellipsis-vertical" onClick={showProfilePage}></i>
                    </div>
                </div>
                <div className="list-search">
                    <input type="search" name="listSearch" className="list-search" placeholder="Search or start a new chat" onChange={handleInputChange} />
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <UserList userListRef={userListRef} fetchRoomConversation={fetchRoomConversation} makeItResponsive={makeItResponsive} />
                {currentUser && <Profile profileRef={profileRef} />}
                <ChatList fetchRoomConversation={fetchRoomConversation} />
            </div>
            <ChatPage loading={loading} error={error} setSubcribedRooms={setSubcribedRooms} chatPageRef={chatPageRef} makeItResponsive={makeItResponsive} />
        </div>
    )
}

export default Home;