import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import '../styles/home.css';
import UserList from '../components/UserList';
import { filterChatList, getRecentConversations, getUsers, getConversationByRoomId, setRoomConversation, setNewChat } from '../features/chats/chatSlice';
import ChatList from '../components/ChatList';
import ChatPage from '../components/ChatPage';
import { joinRoom } from '../services/socket';
import Profile from '../components/Profile';
import { serverUrl } from '../api/apiEndpoint';

const Home = () => {

    const { isLoggedIn, currentUser, roomConversation, allRoomConversations, newChat } = useSelector(state => state.chat);
    const navigate = useNavigate();
    const homePageRef = useRef();
    const userListRef = useRef();
    const profileRef = useRef();
    const mainPageRef = useRef();
    const chatPageRef = useRef();
    const dispatch = useDispatch()
    const [joinedRooms, setJoinedRooms] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOrientationLandscape, setOrientation] = useState(false);

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
            setIsLoading(true);
            await dispatch(getConversationByRoomId(roomId)).unwrap();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        };
    };

    // Fetching room conversation, joining room and preventing user from trying to join same room multiple time
    const fetchRoomConversation = (roomId, otherUserId) => {
        makeItResponsive();
        if (newChat) {
            dispatch(setNewChat(null));
        };
        checkRoomConversation(roomId);
        // Preventing user from sending join request for previously joined room
        if (joinedRooms) {
            const existingRoom = joinedRooms.filter((room) => {
                return room === roomId;
            })[0];
            if (!existingRoom) {
                joinRoom(roomId, otherUserId);
                setJoinedRooms([...joinedRooms, roomId]);
            };
        } else {
            joinRoom(roomId, otherUserId);
            setJoinedRooms([roomId]);
        };
    };

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getRecentConversations());
        } else {
            navigate('/login');
        };
    }, [isLoggedIn]);

    // setting height after page load because causing layout issues in mobile devices because of address bar and checking orientation
    const checkPhoneOrientation = () => {
        // setting height to fix layout issue in mobile browser
        if (homePageRef.current) {
            homePageRef.current.style.height = `${window.innerHeight}px`;
        };
        if (window.orientation === 90 && window.matchMedia('(max-height:600px)')) {
            setOrientation(true);
        } else {
            setOrientation(false);
        };
    };

    useEffect(() => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
        if (isMobile) {
            window.addEventListener('orientationchange', checkPhoneOrientation);
            window.addEventListener('resize', checkPhoneOrientation);
            // initial call
            checkPhoneOrientation();
            // cleaning up event listener
            return (() => {
                window.removeEventListener('orientationchange', checkPhoneOrientation);
                window.addEventListener('resize', checkPhoneOrientation);
            });
        };
    }, []);

    return (<>{isOrientationLandscape ?
        <div className='landscape' ref={homePageRef}>
            <h3>Landscape mode for mobile devices isn't supported yet.</h3>
            <h4>Please rotate your phone.</h4>
        </div> :
        <div className="app" ref={homePageRef}>
            <div className="main-page" ref={mainPageRef}>
                <div className="user-profile">
                    <div className="user-profile-details">
                        <div>
                            {currentUser && <img src={`${serverUrl}/${currentUser.image}`} alt="dp" onClick={showProfilePage} />}
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
                <UserList
                    userListRef={userListRef}
                    fetchRoomConversation={fetchRoomConversation}
                    makeItResponsive={makeItResponsive}
                />
                {currentUser && <Profile profileRef={profileRef} />}
                <ChatList fetchRoomConversation={fetchRoomConversation} showUserList={showUserList} />
            </div>
            <ChatPage
                isLoading={isLoading}
                error={error}
                setJoinedRooms={setJoinedRooms}
                chatPageRef={chatPageRef}
                makeItResponsive={makeItResponsive}
            />
        </div>
    }</>
    )
}

export default Home;