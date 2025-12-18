import {jwtDecode} from "jwt-decode";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  // Function to fetch and decode the token
  const fetchToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuth({});
      setIsLoggedIn(false)
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setAuth({});
        setIsLoggedIn(false)
        return;
      }

      setAuth({
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        status: decoded.status,
        exp: decoded.exp,
        iat: decoded.iat,
      });
      setIsLoggedIn(true)
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setAuth({});
    }
  };

  // Run on mount and whenever the token changes in other tabs
  useEffect(() => {
    fetchToken();

    const handleStorageChange = (event) => {
      if (event.key === "token") {
        fetchToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
