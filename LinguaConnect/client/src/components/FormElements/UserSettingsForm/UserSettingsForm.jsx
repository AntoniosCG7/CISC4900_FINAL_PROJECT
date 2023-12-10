import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "../../../slices/alertSlice";
import { updateUser } from "../../../slices/authSlice";
import { resetChatState } from "../../../slices/chatSlice";
import axios from "axios";
import { Modal, Box, Typography, Button } from "@mui/material";
import "./UserSettingsForm.css";

const UserSettingsForm = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/users/deleteMe/${currentUser._id}`,

        { withCredentials: true }
      );
      dispatch(
        addAlert({ type: "success", message: "Account deleted successfully!" })
      );
      dispatch(resetChatState());
      navigate("/login");
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const modalStyle = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
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
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                fontWeight: "bold",
                backgroundColor: "var(--secondary-color)",
                width: "100%",
                padding: "10px 0",
                "&:hover": {
                  color: "var(--secondary-color)",
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 0 30px var(--primary-color)",
                },
              }}
            >
              Save Settings
            </Button>
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
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                fontWeight: "bold",
                backgroundColor: "var(--secondary-color)",
                width: "100%",
                padding: "10px 0",
                "&:hover": {
                  color: "var(--secondary-color)",
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 0 30px var(--primary-color)",
                },
              }}
            >
              Save Password
            </Button>
          </fieldset>
        </form>
      </div>

      <div className="delete-account-container">
        <fieldset className="delete-account-section">
          <legend>Delete Account</legend>
          <p className="delete-account-description">
            Please be aware that deleting your account will result in the
            permanent loss of all your account data, including profile
            information, events, and messages. This action cannot be undone.
          </p>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenDeleteModal}
              style={{
                fontWeight: 600,
              }}
            >
              Delete my Account
            </Button>
          </Box>
        </fieldset>
      </div>

      <Modal open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Confirm Account Deletion
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={handleCloseDeleteModal}
              sx={{ width: "130px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleDeleteAccount}
              sx={{ width: "130px" }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default UserSettingsForm;
