import React, { useEffect, useRef, useState } from 'react';
import '../styles/showMessages.css';
import msToTime from '../helper/msToTime';
import { useDispatch } from 'react-redux';
import { deleteMessageForEveryone, deleteMessageForSingleUser, editMessage, markMessagesAsSeen, updatePendingMessages } from '../features/chats/chatSlice';

const ShowMessages = ({ roomConversation, chatPageRef, pendingMessages }) => {

    const [currentRoom, setCurrentRoom] = useState(null);
    const [currentModal, setCurrentModal] = useState();
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageInfo, setShowMessageInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState('');
    const [deleteType, setDeleteType] = useState('');

    const messagesRef = useRef();
    const messageRefs = useRef({});
    const popupModalRefs = useRef({});
    const editFormRef = useRef();
    const deleteRef = useRef();

    const dispatch = useDispatch();

    const { user, messages } = roomConversation;
    const { _id: otherUserId, roomId } = user;
    let initialDate = '01/01/1970';

    // handling message scroll to mark them as read
    const handleMessageScroll = () => {
        const container = messagesRef.current;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const scrollPosition = container.scrollTop;
        const unreadMessagesIds = [];

        messages.forEach(message => {
            if (!message.read.status && message.sentBy._id === otherUserId) {
                const messageRef = messageRefs.current[message._id];
                if (messageRef) {
                    const messageTop = messageRef.offsetTop;
                    const messageHeight = messageRef.clientHeight;
                    if (messageTop >= scrollPosition && messageTop + messageHeight <= scrollPosition + containerHeight) {
                        unreadMessagesIds.push(message._id);
                    };
                };
            };
        });
        if (unreadMessagesIds.length) {
            markMessagesAsSeen(unreadMessagesIds, roomId, otherUserId);
        };
    };

    // setting scroll behaviour of chat page
    useEffect(() => {
        const container = messagesRef.current;
        // adding scroll listener to message container with messages dependency to access updated messages inside from handleMessagesScroll
        container.addEventListener('scroll', handleMessageScroll);
        // calling handleMessageScroll function if messages are not scrollable to mark them as read
        if (container.scrollHeight <= container.clientHeight) {
            handleMessageScroll();
        };

        // finding last message from messages array
        const lastMessage = messages[messages.length - 1];
        // checking if user already scrolled to bottom before arriving new message
        // const isScrolledToBottom = container.scrollHeight - container.clientHeight - container.lastChild.clientHeight <= container.scrollTop + 1;
        // getting last message element from messageRefs because container.lastChild contains delete popup
        let lastMessageElement = messageRefs.current[lastMessage._id];
        const isScrolledToBottom = container.scrollHeight - container.clientHeight - lastMessageElement.clientHeight <= container.scrollTop + 1 + 1;
        // scrolling to bottom incase of isScrolledToBottom is true or if last message was sent by user
        if (isScrolledToBottom || lastMessage.sentBy._id !== otherUserId) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        } else {
            // scrolling to bottom if height of unreadMessages not more than half of container clientHeight otherwise scrolling accordingly
            const unreadMessages = messages.filter(message => {
                return !message.read.status && message.sentBy._id === otherUserId;
            });
            let unreadMessagesHeight = 0;
            if (unreadMessages.length) {
                unreadMessages.forEach(message => {
                    const messageRef = messageRefs.current[message._id];
                    unreadMessagesHeight += messageRef.clientHeight;
                });
            };
            const containerHeight = container.clientHeight;
            if (unreadMessagesHeight > containerHeight / 2 && (!currentRoom || currentRoom !== roomId)) {
                container.scrollTop = container.scrollHeight - unreadMessagesHeight - (containerHeight / 2);
            } else if (!currentRoom || currentRoom !== roomId) {
                container.scrollTop = container.scrollHeight - container.clientHeight;
            };
        };
        setCurrentRoom(roomId);
        // cleaning up event listener whenever messages dependency changes
        return () => {
            container.removeEventListener('scroll', handleMessageScroll);
        };
    }, [messages, pendingMessages]);

    // from here handling popup modal starts to manipulate message
    // handling long press on messages
    const handleLongPress = (e, message) => {
        e.preventDefault();
        if (currentModal) {
            closePopupModal();
        };
        const currentModalRef = popupModalRefs.current[message._id];
        setCurrentModal(currentModalRef);
        setSelectedMessage(message);
        currentModalRef.style.display = 'block';
    };

    // closing popup modal
    const closePopupModal = () => {
        if (currentModal) {
            currentModal.style.display = 'none';
        };
        if (editFormRef) {
            editFormRef.current.style.display = 'none';
        };
        if (deleteRef) {
            deleteRef.current.style.display = 'none';
        };
        setShowMessageInfo(false);
        setSelectedMessage(null);
        setContent('');
        setDeleteType('');
    };
    // copying text to clipboard
    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        closePopupModal();
    };

    // showing edit message modal
    const showEditModal = () => {
        currentModal.style.display = 'none';
        setContent(selectedMessage.content);
        editFormRef.current.style.display = 'block';
    };
    // editing message
    const handleEditMessage = async (e) => {
        e.preventDefault();
        if (selectedMessage.content === content) return closePopupModal();
        try {
            setIsLoading(true);
            await dispatch(editMessage({ content, messageId: selectedMessage._id })).unwrap();
            closePopupModal();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };
    // showing popup modal for deleting messages
    const showDeleteModal = (type) => {
        currentModal.style.display = 'none';
        setDeleteType(type);
        deleteRef.current.style.display = 'block';
    };

    // will execute when click event occurs in parent component chatPage
    const handleParentClick = (e) => {
        // if click event occurs outside popal modal, modal will close
        if ((currentModal && !currentModal.contains(e.target)) && (editFormRef && !editFormRef.current.contains(e.target)) && (deleteRef && !deleteRef.current.contains(e.target))) {
            closePopupModal();
        };
    };

    // deleting messages
    const deleteMessage = async () => {
        try {
            setIsLoading(true);
            if (deleteType === 'me') {
                await dispatch(deleteMessageForSingleUser({ messageId: selectedMessage._id, senderId: selectedMessage.sentBy._id })).unwrap();
            };
            if (deleteType === 'everyone') {
                await dispatch(deleteMessageForEveryone({ messageId: selectedMessage._id, senderId: selectedMessage.sentBy._id })).unwrap();
            };
            closePopupModal()
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        };
    };

    useEffect(() => {
        // adding and removing event listener on parent component chatpage to handle the popup modal
        const chatPage = chatPageRef.current;
        chatPage.addEventListener('click', handleParentClick);

        if (chatPage) {
            return () => {
                chatPage.removeEventListener('click', handleParentClick);
            };
        };
    }, [currentModal]);

    // deleting pending message
    const deletePendingMessage = (message) => {
        const filteredPendingMessages = pendingMessages.filter(elem => elem._id !== message._id);
        localStorage.setItem('pendingMessages', JSON.stringify(filteredPendingMessages));
        dispatch(updatePendingMessages(filteredPendingMessages));
    };

    return (
        <div className="messages" id='messages' ref={messagesRef}>
            {
                messages.map((message, index) => {
                    const { _id: messageId, content, sentBy, delivered, read, isEdited, deletedForEveryone, createdAt } = message;
                    const { _id: senderId } = sentBy;
                    const { result, sendingTime, dayAndDate } = msToTime(createdAt);
                    const { result: deliveryDate, sendingTime: deliveryTime } = msToTime(delivered.timeStamp);
                    const { result: readDate, sendingTime: readTime } = msToTime(read.timeStamp);
                    const fontWeight = !read.status && otherUserId === senderId ? 'bold' : '';

                    // defining popup modal
                    const popupModal = <div className='popup-modal' ref={ref => popupModalRefs.current[messageId] = ref}>
                        {!deletedForEveryone && <div className='first-row'>
                            {showMessageInfo ? <p className='message-info'>
                                <span><i className="fa-solid fa-check-double"></i> Delivered</span>
                                <span className='time'>{delivered.status ? `${deliveryDate}, ${deliveryTime}` : '---'}</span>
                            </p> : <>
                                <p onClick={() => setShowMessageInfo(true)}>
                                    <i className="fa-solid fa-circle-info icons"></i><span>Info</span>
                                </p>
                                <p onClick={() => copyText(content)}>
                                    <i className="fa-regular fa-copy icons"></i><span>Copy</span>
                                </p>
                            </>
                            }
                        </div>}
                        <div className='second-row'>
                            {showMessageInfo && !deletedForEveryone ? <p className='message-info'>
                                <span><i style={{ color: 'rgb(0, 0, 255)' }} className="fa-solid fa-check-double"></i> Seen</span>
                                <span className='time'>{read.status ? `${readDate}, ${readTime}` : '---'}</span>
                            </p> : <>
                                {otherUserId !== senderId && !deletedForEveryone && <p onClick={showEditModal}>
                                    <i className="fa-regular fa-pen-to-square icons"></i><span>Edit</span>
                                </p>}
                                <p onClick={() => showDeleteModal('me')}>
                                    <i className="fa-solid fa-trash icons single-delete"></i><span>Delete for me</span>
                                </p>
                                {otherUserId !== senderId && !deletedForEveryone && <p onClick={() => showDeleteModal('everyone')}>
                                    <i className="fa-solid fa-trash icons all-delete"></i><span>Delete for everyone</span>
                                </p>}
                            </>
                            }
                        </div>
                    </div>

                    // creating message element
                    const messageElement = <div className='message' onContextMenu={e => handleLongPress(e, message)}>
                        <p className="message-content">{deletedForEveryone && senderId === otherUserId ?
                            <span className='deleted-message'>
                                <i className="fa-solid fa-ban"></i> <i>This message was deleted</i>
                            </span> : deletedForEveryone ? <span className='deleted-message'>
                                <i className="fa-solid fa-ban"></i> <i>You deleted this message</i>
                            </span> : content}
                        </p>
                        <p className='info'>
                            {isEdited && !deletedForEveryone && <span>Edited</span>}
                            <span className="message-time">{sendingTime}</span>
                            {!deletedForEveryone && senderId !== otherUserId && <span>
                                {!delivered.status ? <i className="fa-solid fa-check"></i> : <i style={read.status ? { color: 'rgb(0, 0, 255)' } : null} className="fa-solid fa-check-double"></i>}
                            </span>}
                        </p>
                        {popupModal}
                    </div>

                    if (initialDate !== dayAndDate) {
                        initialDate = dayAndDate;
                        return <div key={index} ref={(ref) => (messageRefs.current[messageId] = ref)} className='first-message'>
                            <div className="show-date">
                                <p>{result === 'today' ? 'Today' : result === 'yesterday' ? 'Yesterday' : dayAndDate}</p>
                            </div>
                            <div style={{ fontWeight }} className={otherUserId === senderId ? 'received' : 'sent'}>
                                {messageElement}
                            </div>
                        </div>
                    } else {
                        return <div style={{ fontWeight }} className={otherUserId === senderId ? 'received' : 'sent'} key={index} ref={(ref) => (messageRefs.current[messageId] = ref)}>
                            {messageElement}
                        </div>
                    }
                })
            }
            {/* populating pending messages if any */}
            {
                pendingMessages.length > 0 && pendingMessages.map((message, index) => {
                    const { _id, content, timeStamp, roomId: pendingMessageRoomId, receiver } = message;
                    const { sendingTime, result, dayAndDate } = msToTime(timeStamp);
                    if (pendingMessageRoomId === roomId && receiver === otherUserId) {
                        // defining popup modal
                        const popupModal = <div className='popup-modal' ref={ref => popupModalRefs.current[_id] = ref}>
                            <div className='second-row'>
                                <p onClick={() => deletePendingMessage(message)}>
                                    <i className="fa-solid fa-trash icons all-delete"></i><span>Delete this message</span>
                                </p>
                            </div>
                        </div>

                        // creating message element
                        const messageElement = <div className='message' onContextMenu={e => handleLongPress(e, message)}>
                            <p className="message-content">{content}</p>
                            <p className='info'>
                                <span className="message-time">{sendingTime}</span>
                                <span><i className="fa-regular fa-clock"></i></span>
                            </p>
                            {popupModal}
                        </div>

                        if (initialDate !== dayAndDate) {
                            initialDate = dayAndDate;
                            return <div key={index} ref={(ref) => (messageRefs.current[_id] = ref)} className='first-message'>
                                <div className="show-date">
                                    <p>{result === 'today' ? 'Today' : result === 'yesterday' ? 'Yesterday' : dayAndDate}</p>
                                </div>
                                <div className="sent">
                                    {messageElement}
                                </div>
                            </div>
                        } else {
                            return <div className="sent" key={index} ref={(ref) => (messageRefs.current[_id] = ref)}>
                                {messageElement}
                            </div>
                        }
                    }
                })
            }
            {/* popup modal for editing message */}
            <div className="edit-popup" ref={editFormRef}>
                <form onSubmit={handleEditMessage}>
                    <div className="input">
                        <input type="text" name='content' className="input-field" required value={content} onChange={e => setContent(e.target.value)} />
                    </div>
                    <div className="button">
                        <button type="submit" disabled={isLoading} className={isLoading ? 'disable' : ''}>{isLoading ? 'Updating...' : 'Update'}</button>
                    </div>
                </form>
            </div>
            {/* popup modal for deleting messages */}
            <div className='delete-popup' ref={deleteRef}>
                <p>{deleteType === 'everyone' ? 'This message will be deleted for everyone in this chat.' : 'This message will be deleted for you.'}</p>
                <div className='buttons'>
                    <button onClick={() => closePopupModal()}>Cancel</button>
                    <button className='delete' onClick={deleteMessage}>Delete</button>
                </div>
            </div>
        </div>
    )
}

export default ShowMessages;