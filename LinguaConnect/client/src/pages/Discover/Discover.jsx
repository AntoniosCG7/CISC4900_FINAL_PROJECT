import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLoading } from "../../contexts/LoadingContext";
import { Navbar, UserCard } from "../../components";
import "./Discover.css";

const Discover = () => {
  const [users, setUsers] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const MAX_USERS_DISPLAYED = 25;
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/",
          {
            withCredentials: true,
          }
        );
        // Filter out the current user and users who have registered but not completed their profile before setting to state
        const usersToDisplay = response.data.data.users.filter(
          (user) =>
            user._id !== currentUser._id && user.profileCompleted === true
        );
        setUsers(usersToDisplay);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, setLoading]);

  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="user-card-container">
          {users.slice(0, MAX_USERS_DISPLAYED).map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Discover;
