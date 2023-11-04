import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./routing/ProtectedRoute";
import Alert from "./components/UIElements/Alert/Alert";
import { LoadingProvider } from "./contexts/LoadingContext";
import {
  Home,
  About,
  Contact,
  Login,
  Register,
  ProfileCreation,
  PersonalProfile,
  EditProfile,
  PublicProfile,
  User,
  Chat,
  Map,
  Discover,
} from "./pages";

function App() {
  return (
    <>
      <LoadingProvider>
        <BrowserRouter>
          <Alert />
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/create-profile"
              element={
                <SocketProvider>
                  <ProtectedRoute component={ProfileCreation} />
                </SocketProvider>
              }
            />
            <Route
              path="/profile"
              element={
                <SocketProvider>
                  <ProtectedRoute
                    component={PersonalProfile}
                    profileRequired={true}
                  />
                </SocketProvider>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <SocketProvider>
                  <ProtectedRoute
                    component={EditProfile}
                    profileRequired={true}
                  />
                </SocketProvider>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <SocketProvider>
                  <ProtectedRoute
                    component={PublicProfile}
                    profileRequired={true}
                  />
                </SocketProvider>
              }
            />
            <Route
              path="/discover"
              element={
                <SocketProvider>
                  <ProtectedRoute component={Discover} profileRequired={true} />
                </SocketProvider>
              }
            />
            <Route
              path="/user"
              element={
                <SocketProvider>
                  <ProtectedRoute component={User} profileRequired={true} />
                </SocketProvider>
              }
            />
            <Route
              path="/chat"
              element={
                <SocketProvider>
                  <ProtectedRoute component={Chat} profileRequired={true} />
                </SocketProvider>
              }
            />
            <Route
              path="/map"
              element={
                <SocketProvider>
                  <ProtectedRoute component={Map} profileRequired={true} />
                </SocketProvider>
              }
            />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </>
  );
}

export default App;
