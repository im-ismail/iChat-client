const userAPI = 'http://localhost:5000/users';

const registerUser = `${userAPI}/register`;
const loginUser = `${userAPI}/login`;
const authenticateUser = `${userAPI}/authenticate`;
const getAllUser = userAPI;
const updateUser = userAPI;
const logout = `${userAPI}/logout`;
const deleteUser = userAPI;

module.exports = { registerUser, loginUser, authenticateUser, getAllUser, updateUser, logout, deleteUser };