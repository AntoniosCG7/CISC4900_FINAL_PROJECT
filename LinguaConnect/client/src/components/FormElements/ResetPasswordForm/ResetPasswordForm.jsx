import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAlert } from "../../../slices/alertSlice";
import { useLoading } from "../../../contexts/LoadingContext";
import axios from "axios";
import "./ResetPasswordForm.css";

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, setLoading } = useLoading();

  const handlePasswordResetSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(
        addAlert({ type: "error", message: "New passwords do not match!" })
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/v1/users/resetPassword/${token}`,
        {
          password: newPassword,
          passwordConfirm: confirmPassword,
        }
      );
      dispatch(
        addAlert({ type: "success", message: "Password updated successfully!" })
      );
      navigate("/login");
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="forgot-password-form">
        <div className="forgot-password-form-container">
          <h1 className="forgot-password-form-title">Reset Password</h1>
          <form onSubmit={handlePasswordResetSubmit}>
            <div className="forgot-password-input">
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label>New Password</label>
              <i className="bx bxs-lock-open-alt"></i>
            </div>
            <div className="forgot-password-input">
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label>Confirm New Password</label>
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className="forgot-password-btn">
              Change Password
            </button>
            <div className="back-to-login">
              <p>
                Remembered your password?{" "}
                <Link to="/login" className="login-link">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
