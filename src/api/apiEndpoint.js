const serverUrl = process.env.REACT_APP_SERVER_URL;

// User API endpoints
const userAPI = {
    userRegistrationEndpoint: `${serverUrl}/users/start-registration`,
    otpVerificationForRegistrationEndpoint: `${serverUrl}/users/complete-registration`,
    resendOtpForRegistrationEndpoint: `${serverUrl}/users/register/resend-otp`,
    userLoginEndpoint: `${serverUrl}/users/login`,
    userAuthenticationEndpoint: `${serverUrl}/users/authenticate`,
    getAllUsersEndpoint: `${serverUrl}/users`,
    updateUserEndpoint: `${serverUrl}/users`,
    logoutUserEndpoint: `${serverUrl}/users/logout`,
    deleteUserEndpoint: `${serverUrl}/users`,
    updateProfilePicEndpoint: `${serverUrl}/users/upload/profile`,
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