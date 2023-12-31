import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from 'socket.io-client';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Error from "./pages/Error";
import ResetPassword from "./pages/ResetPassword";
import { authenticateUser } from "./features/chats/chatSlice";
import configureSocket from "./services/socket";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { serverUrl } from "./api/apiEndpoint";

function App() {

  const { isLoggedIn, currentUser, notification } = useSelector(state => state.chat);

  const dispatch = useDispatch();
  // Checking user authentication
  useEffect(() => {
    dispatch(authenticateUser());
  }, []);

  // Initialising socket connection
  useEffect(() => {
    let socket = null;
    if (isLoggedIn) {
      // Connect to the server using Socket.io
      socket = io.connect(serverUrl);
      // Calling the socket module
      configureSocket(socket, currentUser._id, dispatch);
    };
    // Clean up the socket connection when component unmounts
    if (socket) {
      return () => {
        console.log(`Disconnecting ${socket.id}`);
        socket.disconnect();
      };
    };
  }, [isLoggedIn]);

  // Alerting incase of any error occured
  useEffect(() => {
    // if (notification) {
    //   toast(notification);
    // };
  }, [notification]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
