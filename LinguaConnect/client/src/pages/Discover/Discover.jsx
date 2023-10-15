import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Navbar, UserCard } from "../../components";
import "./Discover.css";

const discover = () => {
  const [users, setUsers] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const MAX_USERS_DISPLAYED = 25;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/",
          {
            withCredentials: true,
          }
        );

        // Filter out the current user before setting to state
        const usersWithoutCurrentUser = response.data.data.users.filter(
          (user) => user._id !== currentUser._id
        );
        setUsers(usersWithoutCurrentUser);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUser]);

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

export default discover;
