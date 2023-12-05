import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "../../../slices/alertSlice";
import { updateUser } from "../../../slices/authSlice";
import axios from "axios";
import "./UserSettingsForm.css";

const UserSettingsForm = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    setUsername(currentUser.username);
    setEmail(currentUser.email);
  }, [currentUser]);

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.patch(
        "http://localhost:3000/api/v1/users/updateSettings",
        {
          username,
          email,
        },
        { withCredentials: true }
      );
      dispatch(updateUser(response.data.data.user));
      dispatch(
        addAlert({ type: "success", message: "Profile updated successfully!" })
      );
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(
        addAlert({ type: "error", message: "New passwords do not match!" })
      );
      return;
    }
    try {
      const response = await axios.patch(
        "http://localhost:3000/api/v1/users/updatePassword",
        {
          password: newPassword,
          passwordConfirm: confirmPassword,
          currentPassword: currentPassword,
        },
        { withCredentials: true }
      );
      dispatch(
        addAlert({ type: "success", message: "Password updated successfully!" })
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
    }
  };

  return (
    <div className="main-container">
      <h1 className="page-title">Your Account Settings</h1>
      <div className="settings-form-container">
        <form onSubmit={handleSettingsSubmit}>
          <fieldset className="username-email-section">
            <legend>Username & Email</legend>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="save-button">
              Save
            </button>
          </fieldset>
        </form>
      </div>

      <div className="settings-form-container">
        <form onSubmit={handlePasswordSubmit}>
          <fieldset className="password-section">
            <legend>Change Password</legend>
            <label>Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="save-button">
              Save Password
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UserSettingsForm;
