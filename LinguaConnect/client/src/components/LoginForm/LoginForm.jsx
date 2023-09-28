import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addAlert } from "../../slices/alertSlice";
import { authenticationSuccess, authError } from "../../slices/authSlice";
import "./LoginForm.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileCompleted = useSelector((state) => state.auth.profileCompleted);

  const handleInputBlur = (e) => {
    if (!e.target.validity.valid) {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: "",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/login",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        dispatch(authenticationSuccess());
        dispatch(
          addAlert({
            message: "User logged in successfully!",
            type: "success",
          })
        );
        if (!profileCompleted) {
          navigate("/create-profile");
        } else {
          navigate("/discover");
        }
      } else {
        dispatch(
          addAlert({
            type: "error",
            message: response.data.errorMessage || "Login failed.",
          })
        );
      }
    } catch (error) {
      dispatch(authError(error));
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Error logging in.";
      dispatch(
        addAlert({
          message: errorMessage,
          type: "error",
        })
      );
    }
  };

  return (
    <>
      <div className="body">
        <div className="login-form">
          <div className="login-form-container">
            <h1 className="login-form-title">Login</h1>
            <form onSubmit={handleFormSubmit}>
              <div className="login-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                />
                <label>Email</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="login-form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <label>Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <button type="submit" className="login-btn">
                Log In
              </button>
              <div className="register">
                <p>
                  Don't have an account?{" "}
                  <Link to="/register" className="register-link">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
