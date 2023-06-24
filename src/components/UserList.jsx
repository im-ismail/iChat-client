import { useDispatch, useSelector } from 'react-redux';
// import '../styles/userList.css';
import Loading from './Loading';
import { filterUsersList, setNewChat } from '../features/chats/chatSlice';

const UserList = ({ userListRef, fetchRoomConversation }) => {

    const { isLoading, isError, users, recentConversations } = useSelector(state => state.chat);
    const dispatch = useDispatch();

    // Closing user list
    const closeUserList = () => {
        const usersRef = userListRef.current;
        usersRef.style.display = 'none';
    };

    // Search for a particular user from list
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        dispatch(filterUsersList(inputValue));
    };

    // handling list click
    const handleUserListClick = (user) => {
        const matchedConversation = recentConversations.filter((conversation) => {
            return conversation.user.number === user.number;
        })[0];
        if (matchedConversation) {
            const { _id, roomId } = matchedConversation.user;
            fetchRoomConversation(roomId, _id);
        } else {
            dispatch(setNewChat(user));
        };
    };

    return (
        <div className="users" ref={userListRef}>
            <>
                {isLoading && !users && <Loading />}
                {isError && !users && <p>Some error occured</p>}
            </>
            {
                users && <><div className='stick'>
                    <div className='close'>
                        <i className="fa-regular fa-circle-xmark" onClick={closeUserList}></i>
                    </div>
                    <div className="list-search">
                        <input type="search" name="listSearch" placeholder="Search by name or number" onChange={handleInputChange} />
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                </div>
                    <div className="userList">
                        {
                            users.map((user, index) => {
                                const { name, number } = user;
                                let num = number.toString();
                                num = num.slice(0, 2) + '****' + num.slice(6);
                                return <div className="user" key={index} onClick={() => handleUserListClick(user)}>
                                    <div>
                                        <img src={user.image || 'images/dp.jpg'} alt="" className="participant-profile-pic" />
                                    </div>
                                    <div>
                                        <h3>{name}</h3>
                                        <p>{num}</p>
                                    </div>
                                </div>
                            })
                        }
                    </div></>
            }
        </div>
    )
}

export default UserList;