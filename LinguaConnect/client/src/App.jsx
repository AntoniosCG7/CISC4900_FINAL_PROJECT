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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

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
          <Route path="/create-profile" element={<ProtectedRoute />}>
            <Route index element={<ProfileCreation />} />
          </Route>

          <Route path="/" element={<ProtectedRoute profileRequired={true} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/user" element={<User />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/map" element={<Map />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
