import "./LoginForm.css";

const LoginForm = () => {
  return (
    <>
      <div className="body">
        <div className="login-form">
          <div className="login-form-container">
            <h1 className="login-form-title">Login</h1>
            <form action="">
              <div className="login-form-group">
                <input type="text" required />
                <label>Username</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="login-form-group">
                <input type="password" required />
                <label>Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <button type="submit" className="login-btn">
                Log In
              </button>
              <div className="register">
                <p>
                  Don't have an account?{" "}
                  <a href="Register" className="register-link">
                    Sign Up
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

export default LoginForm;
