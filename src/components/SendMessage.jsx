import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import { emitTyping } from '../services/socket';
import { sendMessage } from '../features/chats/chatSlice';

const SendMessage = ({ user, setJoinedRooms, currentUser }) => {

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

    // closing emoji picker if user click outside of emoji picker when emoji picker is open
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiPickerOpenRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            };
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    // Function for sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message) {
            try {
                const data = await dispatch(sendMessage({ message, roomId, otherUserId })).unwrap();
                setMessage('');
                // adding this newly created roomId to subscribedRoom to avoid any conflict
                if (!roomId) {
                    setJoinedRooms(prev => prev ? [...prev, data.message.roomId] : [data.message.roomId]);
                };
            } catch (error) {
                console.log(error);
            }
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