const serverUrl = process.env.REACT_APP_SERVER_URL;

// User API endpoints
const userAPI = {
    sendOtpForRegistrationEndpoint: `${serverUrl}/users/start-registration`,
    verifyOtpForRegistrationEndpoint: `${serverUrl}/users/complete-registration`,
    resendOtpForRegistrationEndpoint: `${serverUrl}/users/register/resend-otp`,
    userLoginEndpoint: `${serverUrl}/users/login`,
    userAuthenticationEndpoint: `${serverUrl}/users/authenticate`,
    getAllUsersEndpoint: `${serverUrl}/users`,
    updateUserEndpoint: `${serverUrl}/users`,
    logoutUserEndpoint: `${serverUrl}/users/logout`,
    deleteUserEndpoint: `${serverUrl}/users`,
    updateProfilePicEndpoint: `${serverUrl}/users/upload/profile`,
    sendOtpForPassResetEndpoint: `${serverUrl}/users/password-reset/initiate`,
    verifyOtpForPassResetEndpoint: `${serverUrl}/users/password-reset/verify`,
    PassResetEndpoint: `${serverUrl}/users/password-reset/complete`,
};

// Chat API endpoints
const chatAPI = {
    createRoomEndpoint: `${serverUrl}/room/initiate`,
    sendMessagEndpoint: `${serverUrl}/room`,
    recentConversationsEndpoint: `${serverUrl}/room`,
    roomConversationEndpoint: `${serverUrl}/room`,
};

module.exports = {
    serverUrl,
    ...userAPI,
    ...chatAPI,
};