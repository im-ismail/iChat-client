import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import '../styles/sendMessage.css';
import { emitTyping } from '../services/socket';
import { sendMessage, updateConnectionStatus, updatePendingMessages } from '../features/chats/chatSlice';

const SendMessage = ({ user, setJoinedRooms, currentUser, isConnected, pendingMessages }) => {

    const { _id: otherUserId, roomId, name } = user;
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const emojiPickerOpenRef = useRef(null);
    const dispatch = useDispatch();

    // function for handling change event
    const handleChange = (e) => {
        setMessage(e.target.value);
        // this will only send typing event if users are connected
        if (roomId) {
            emitTyping(roomId, currentUser._id);
        };
    };
    // function for emoji input
    const handleEmojiClick = (emojiData, event) => {
        const emoji = emojiData.emoji;
        setMessage((prevMessage) => prevMessage + emoji);
        // this will only send typing event if users are connected
        if (roomId) {
            emitTyping(roomId, currentUser._id);
        };
    };
    // toggling emoji picker
    const handleToggleEmojiPicker = () => {
        setShowEmojiPicker((prevShowEmojiPicker) => !prevShowEmojiPicker);
    };

    // change internet connection status
    const changeConnectionStatus = () => {
        dispatch(updateConnectionStatus(navigator.onLine));
    };

    // closing emoji picker if user click outside of emoji picker when emoji picker is open
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiPickerOpenRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            };
        };
        document.addEventListener('click', handleOutsideClick);
        window.addEventListener('online', changeConnectionStatus);
        window.addEventListener('offline', changeConnectionStatus);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('online', changeConnectionStatus);
            window.removeEventListener('offline', changeConnectionStatus);
        };
    }, []);

    // sending pending messages
    const sendPendingMessages = async (element) => {
        try {
            await dispatch(sendMessage({ message: element.content, roomId: element.roomId, otherUserId })).unwrap();
            const filteredPendingMessages = pendingMessages.filter(elem => elem._id !== element._id);
            localStorage.setItem('pendingMessages', JSON.stringify(filteredPendingMessages));
            dispatch(updatePendingMessages(filteredPendingMessages));
        } catch (error) {
            console.log('error occurred while sending pending messages', error);
        };
    };

    useEffect(() => {
        if (pendingMessages.length > 0 && navigator.onLine) {
            pendingMessages.forEach(element => {
                sendPendingMessages(element);
            });
        };
    }, [isConnected]);

    // Function for sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message) {
            const date = new Date();
            const newMessage = {
                _id: date.getTime(),
                content: message,
                timeStamp: date.getTime(),
                sent: false,
                roomId,
                receiver: otherUserId
            };
            const newPendingMessages = [...pendingMessages, newMessage];
            dispatch(updatePendingMessages(newPendingMessages));

            if (navigator.onLine) {
                try {
                    const data = await dispatch(sendMessage({ message, roomId, otherUserId })).unwrap();
                    const filteredPendingMessages = newPendingMessages.filter(element => element._id !== newMessage._id);
                    dispatch(updatePendingMessages(filteredPendingMessages));
                    // adding this newly created roomId to subscribedRoom to avoid any conflict
                    if (!roomId) {
                        setJoinedRooms(prev => prev ? [...prev, data.message.roomId] : [data.message.roomId]);
                    };
                } catch (error) {
                    localStorage.setItem('pendingMessages', JSON.stringify(newPendingMessages));
                    console.log(error);
                };
            } else {
                localStorage.setItem('pendingMessages', JSON.stringify(newPendingMessages));
            };
            setMessage('');
        };
    };

    return (
        <div className="send-message-section">
            <h4 className="name-tag">{name.slice(0, 1)}</h4>
            <form onSubmit={handleSendMessage}>
                <div className='input-container'>
                    <span className='emoji-field' onClick={handleToggleEmojiPicker} ref={emojiPickerOpenRef}><i className="fa-regular fa-face-smile"></i></span>
                    <input type="text" className="input-field" required value={message} onChange={handleChange} />
                </div>
                {showEmojiPicker && (
                    <div className='emoji-picker-container' ref={emojiPickerRef}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} height={'100%'} width={'100%'} />
                    </div>
                )}
                <p className="send-button" onClick={handleSendMessage}>⩥</p>
            </form>
        </div>
    )
}

export default SendMessage;