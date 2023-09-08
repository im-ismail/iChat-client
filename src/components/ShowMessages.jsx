import React, { useEffect, useRef, useState } from 'react';
import msToTime from '../helper/msToTime';
import { useDispatch } from 'react-redux';
import { editMessage, markMessagesAsSeen } from '../features/chats/chatSlice';

const ShowMessages = ({ roomConversation, chatPageRef }) => {

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
        console.log(messagesRef);
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
    }, [messages]);

    // from here handling popup modal starts to manipulate message
    // handling long press on messages
    const handleLongPress = (e, conversation) => {
        e.preventDefault();
        if (currentModal) {
            closePopupModal();
        };
        const currentModalRef = popupModalRefs.current[conversation._id];
        setCurrentModal(currentModalRef);
        setSelectedMessage(conversation);
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

    // will execute when click event uccurs in parent component chatPage
    const handleParentClick = (e) => {
        // if click event occurs outside popal modal, modal will close
        if ((currentModal && !currentModal.contains(e.target)) && (editFormRef && !editFormRef.current.contains(e.target)) && (deleteRef && !deleteRef.current.contains(e.target))) {
            closePopupModal();
        };
    };

    useEffect(() => {
        // adding and removing event listener on parent component chatpage to handle the popup modal
        chatPageRef.current.addEventListener('click', handleParentClick);

        if (chatPageRef) {
            return () => {
                chatPageRef.current.removeEventListener('click', handleParentClick);
            };
        };
    }, [currentModal]);


    return (
        <div className="messages" id='messages' ref={messagesRef}>
            {
                messages.map((conversation, index) => {
                    const { _id: messageId, content, sentBy, delivered, read, createdAt } = conversation;
                    const { _id: senderId } = sentBy;
                    const { result, sendingTime, dayAndDate } = msToTime(createdAt);
                    const { result: deliveryDate, sendingTime: deliveryTime } = msToTime(delivered.timeStamp);
                    const { result: readDate, sendingTime: readTime } = msToTime(read.timeStamp);
                    const fontWeight = !read.status && otherUserId === senderId ? 'bold' : '';

                    // defining popup modal
                    const popupModal = <div className='popup-modal' ref={ref => popupModalRefs.current[messageId] = ref}>
                        <div className='first-row'>
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
                        </div>
                        <div className='second-row'>
                            {showMessageInfo ? <p className='message-info'>
                                <span><i style={{ color: 'rgb(0, 0, 255)' }} className="fa-solid fa-check-double"></i> Seen</span>
                                <span className='time'>{read.status ? `${readDate}, ${readTime}` : '---'}</span>
                            </p> : <>
                                {otherUserId !== senderId && <p onClick={showEditModal}>
                                    <i className="fa-regular fa-pen-to-square icons"></i><span>Edit</span>
                                </p>}
                                <p onClick={() => showDeleteModal('me')}>
                                    <i className="fa-solid fa-trash icons single-delete"></i><span>Delete for me</span>
                                </p>
                                {otherUserId !== senderId && <p onClick={() => showDeleteModal('everyone')}>
                                    <i className="fa-solid fa-trash icons all-delete"></i><span>Delete for everyone</span>
                                </p>}
                            </>
                            }
                        </div>
                    </div>

                    // creating message element
                    const messageElement = <div className='message' onContextMenu={e => handleLongPress(e, conversation)}>
                        <p className="message-content">{content}</p>
                        <p className='info'>
                            <span className="message-time">{sendingTime}</span>
                            {senderId !== otherUserId && <span>
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
            {/* popup modal for de3leting messages */}
            <div className='delete-popup' ref={deleteRef}>
                <p>{deleteType === 'everyone' ? 'This message will be deleted for everyone in this chat.' : 'This message will be deleted for you.'}</p>
                <div className='buttons'>
                    <button>Cancel</button>
                    <button className='delete'>Delete</button>
                </div>
            </div>
        </div>
    )
}

export default ShowMessages;