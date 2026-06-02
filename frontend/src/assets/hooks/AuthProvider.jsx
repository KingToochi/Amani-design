import { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../Url";

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : {};
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user")
  );

  const [loading, setLoading] = useState(true);

  const refreshAuthToken = async () => {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      return refreshResponse.ok;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return false;
    }
  };

  // Fetch user info from backend to verify token and get user data
  const verifyAndFetchAuth = async () => {
    setLoading(true);

    try {
      let response = await fetch(`${BASE_URL}/userInfo`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
      });

      if (!response.ok && response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          response = await fetch(`${BASE_URL}/userInfo`, {
            method: "GET",
            credentials: "include",
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setAuth(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsLoggedIn(true);
          return true;
        }
      }

      setAuth({});
      setIsLoggedIn(false);
      localStorage.removeItem("user");
      return false;
    } catch (err) {
      console.error("Error verifying auth:", err);
      setAuth({});
      setIsLoggedIn(false);
      localStorage.removeItem("user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run on mount to verify existing session
  useEffect(() => {
    verifyAndFetchAuth();
  }, []);

  // Function to handle logout
  const logout = async () => {
    try {
      // Call logout endpoint (you'll need to create this in backend)
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    
    setAuth({});
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    
  };

 

  return (
    <AuthContext.Provider 
      value={{ 
        auth, 
        setAuth, 
        isLoggedIn, 
        setIsLoggedIn, 
        loading,
        logout,
        verifyAndFetchAuth 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
