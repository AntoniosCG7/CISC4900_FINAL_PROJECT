import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./routing/ProtectedRoute";
import Alert from "./components/UIElements/Alert/Alert";
import { loadUser } from "./slices/authSlice";
import {
  Home,
  About,
  Contact,
  Login,
  Register,
  ProfileCreation,
  Profile,
  User,
  Chat,
  Map,
  Discover,
} from "./pages";

function App() {
  return (
    <>
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
            element={<ProtectedRoute component={ProfileCreation} />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute component={Profile} profileRequired={true} />
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute component={Discover} profileRequired={true} />
            }
          />
          <Route
            path="/user"
            element={<ProtectedRoute component={User} profileRequired={true} />}
          />
          <Route
            path="/chat"
            element={<ProtectedRoute component={Chat} profileRequired={true} />}
          />
          <Route
            path="/map"
            element={<ProtectedRoute component={Map} profileRequired={true} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
