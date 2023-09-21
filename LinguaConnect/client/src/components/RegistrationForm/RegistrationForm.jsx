import React, { useState } from "react";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
  };
  const handleInputBlur = (e) => {
    if (!e.target.validity.valid) {
      setInputValue("");
    }
  };

  return (
    <>
      <div className="body">
        <div className="register-form">
          <div className="register-form-container">
            <h1 className="register-form-title">Register</h1>
            <form action="">
              <div className="register-form-group">
                <input type="text" required />
                <label>Username</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="register-form-group">
                <input
                  type="email"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                />
                <label>Email</label>
                <i className="bx bxs-envelope"></i>
              </div>
              <div className="register-form-group">
                <input type="password" required />
                <label>Password</label>
                <i className="bx bxs-lock-open-alt"></i>
              </div>
              <div className="register-form-group">
                <input type="password" required />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <button type="submit" className="register-btn">
                Register
              </button>
              <div className="login">
                <p>
                  Already have an account?{" "}
                  <a href="login" className="login-link">
                    Log In
                  </a>
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
