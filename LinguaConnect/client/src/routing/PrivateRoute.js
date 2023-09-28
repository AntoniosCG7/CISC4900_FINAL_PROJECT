import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const profileCompleted = useSelector((state) => state.auth.profileCompleted);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (isAuthenticated && !profileCompleted) {
      navigate("/create-profile");
    }
  }, [isAuthenticated, profileCompleted, navigate]);

  return children;
}

export default PrivateRoute;
