export const serverUrl = process.env.REACT_APP_SERVER_URL;

// User API endpoints
export const sendOtpForRegistrationEndpoint = `${serverUrl}/users/start-registration`;
export const verifyOtpForRegistrationEndpoint = `${serverUrl}/users/complete-registration`;
export const resendOtpForRegistrationEndpoint = `${serverUrl}/users/register/resend-otp`;
export const userLoginEndpoint = `${serverUrl}/users/login`;
export const userAuthenticationEndpoint = `${serverUrl}/users/authenticate`;
export const getAllUsersEndpoint = `${serverUrl}/users`;
export const updateUserEndpoint = `${serverUrl}/users`;
export const logoutUserEndpoint = `${serverUrl}/users/logout`;
export const deleteUserEndpoint = `${serverUrl}/users`;
export const updateProfilePicEndpoint = `${serverUrl}/users/upload/profile`;
export const sendOtpForPassResetEndpoint = `${serverUrl}/users/password-reset/initiate`;
export const verifyOtpForPassResetEndpoint = `${serverUrl}/users/password-reset/verify`;
export const PassResetEndpoint = `${serverUrl}/users/password-reset/complete`;
export const sendOtpForEmailChangeEndpoint = `${serverUrl}/users/change-email/initiate`;
export const emailChangeEndpoint = `${serverUrl}/users/change-email/complete`;

// Chat API endpoints
export const createRoomEndpoint = `${serverUrl}/room/initiate`;
export const sendMessagEndpoint = `${serverUrl}/room`;
export const recentConversationsEndpoint = `${serverUrl}/room`;
export const roomConversationEndpoint = `${serverUrl}/room`;
export const editMessageEndpoint = `${serverUrl}/room/message`;
export const markDeliveredEndpoint = `${serverUrl}/room/message/mark-delivered`;
export const markSeenEndpoint = `${serverUrl}/room/message/mark-seen`;
export const singleMessageDeleteEndpoint = `${serverUrl}/room/message/single`;
export const everyoneMessageDeleteEndpoint = `${serverUrl}/room/message/everyone`;
export const deleteChatEndpoint = `${serverUrl}/room/message/chat`;
