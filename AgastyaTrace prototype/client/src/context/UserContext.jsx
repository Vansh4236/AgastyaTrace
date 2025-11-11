import React, { createContext, useState, useEffect } from "react";

// 1. Create the context
export const UserContext = createContext();

// 2. Create the provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // holds logged-in user info
  const [loading, setLoading] = useState(true);

  // Fetch current user from backend on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://agastyatrace2.onrender.com/me", {
          credentials: "include", // send cookies
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data); // depends on your backend response
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading  }}>
      {children}
    </UserContext.Provider>
  );
};
