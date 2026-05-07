import { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../../../Url";

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user info from backend to verify token and get user data
  const verifyAndFetchAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL}/userInfo`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setAuth(data.user);
          setIsLoggedIn(true);
        } else {
          setAuth({});
          setIsLoggedIn(false);
        }
      } else {
        setAuth({});
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Error verifying auth:", err);
      setAuth({});
      setIsLoggedIn(false);
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
