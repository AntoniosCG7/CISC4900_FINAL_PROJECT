import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { addAlert } from "../../slices/alertSlice";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/v1/users/forgotPassword", {
        email,
      });
      dispatch(
        addAlert({
          type: "success",
          message:
            "Password reset email sent successfully. Please check your inbox.",
        })
      );
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
    }
  };

  return (
    <div className="body">
      <div className="forgot-password-form">
        <div className="forgot-password-form-container">
          <h1 className="forgot-password-form-title">
            Did you forget your password?
          </h1>
          <p className="forgot-password-form-text">
            Enter the email address connected to your LinguaConnect account to
            reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="forgot-password-input">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Email</label>
              <i className="bx bxs-envelope"></i>
            </div>
            <button type="submit" className="forgot-password-btn">
              Send Reset Link
            </button>
            <div className="back-to-login">
              <p>
                Want to go back to the login page?{" "}
                <Link to="/login" className="login-link">
                  Click Here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
