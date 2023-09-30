import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addAlert } from "../../../slices/alertSlice";
import { authenticationSuccess, authError } from "../../../slices/authSlice";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        "http://localhost:3000/api/v1/users/register",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        dispatch(authenticationSuccess());
        dispatch(
          addAlert({
            message: "User registered successfully!",
            type: "success",
          })
        );

        navigate("/create-profile");
      } else {
        dispatch(
          addAlert({
            type: "error",
            message: response.data.errorMessage || "Registration failed.",
          })
        );
      }
    } catch (error) {
      dispatch(authError(error));
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data;
        if (errorMessage.includes("username")) {
          dispatch(
            addAlert({
              message: "This username already exists.",
              type: "error",
            })
          );
        } else if (errorMessage.includes("email")) {
          dispatch(
            addAlert({
              message: "This email is already registered.",
              type: "error",
            })
          );
        } else if (errorMessage.includes("Passwords")) {
          dispatch(
            addAlert({
              message: "Passwords do not match.",
              type: "error",
            })
          );
        } else if (errorMessage.includes("length")) {
          dispatch(
            addAlert({
              message: "Password must be at least 8 characters.",
              type: "error",
            })
          );
        } else {
          dispatch(
            addAlert({
              message: "Something went wrong with user validation.",
              type: "error",
            })
          );
        }
      } else {
        dispatch(
          addAlert({
            message: "Something went wrong. Please try again.",
            type: "error",
          })
        );
      }
    }
  };

  return (
    <>
      <div className="body">
        <div className="register-form">
          <div className="register-form-container">
            <h1 className="register-form-title">Register</h1>
            <form onSubmit={handleFormSubmit}>
              <div className="register-form-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <label>Username</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="register-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                />
                <label>Email</label>
                <i className="bx bxs-envelope"></i>
              </div>
              <div className="register-form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <label>Password</label>
                <i className="bx bxs-lock-open-alt"></i>
              </div>
              <div className="register-form-group">
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="passwordConfirm">Confirm Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <button type="submit" className="register-btn">
                Register
              </button>
              <div className="login">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="login-link">
                    Log In
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

export default RegistrationForm;
