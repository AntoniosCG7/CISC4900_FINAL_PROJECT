import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLoading } from "../../contexts/LoadingContext";
import { Navbar, UserCard } from "../../components";
import "./Discover.css";

const Discover = () => {
  const [users, setUsers] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to check if the search term matches any language of the user
  const doesSearchMatchLanguages = (user, searchTerm) => {
    const languages = [
      ...user.languages.native,
      ...user.languages.fluent,
      ...user.languages.learning,
    ];
    return languages.some((language) =>
      language.name.toLowerCase().includes(searchTerm)
    );
  };

  // Filter users based on search term (name, username, or language)
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const searchWords = searchTerm.toLowerCase().split(" ").filter(Boolean);

    const matchesNameUsername = searchWords.every(
      (word) =>
        fullName.includes(word) || user.username?.toLowerCase().includes(word)
    );

    const matchesLanguage = searchTerm
      ? doesSearchMatchLanguages(user, searchTerm.toLowerCase())
      : true;

    return matchesNameUsername || matchesLanguage;
  });

  return (
    <>
      <Navbar />
      <div className="main-container">
        <input
          type="text"
          placeholder="Search by name, username, or language"
          value={searchTerm}
          onChange={handleSearchChange}
          className="discover-search-bar"
        />
        <div className="user-card-container">
          {filteredUsers.slice(0, MAX_USERS_DISPLAYED).map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Discover;
