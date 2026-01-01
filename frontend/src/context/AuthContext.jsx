import { useEffect, useState } from "react";
import API from "../api/api";
import { AuthContext } from "../hook/AuthContext";
import { fetchMe } from "../services/auth.services";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const loadUser = async () => {
    try {
      const userData = await fetchMe();
      setUser(userData);
    } catch (err) {
      setUser(null);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

