"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useEffect,
} from "react";

export type Role = "admin" | "approver" | "user" | null;

interface User {
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
}

interface UserContextType {
  user: User | null;
  setUserDetails: (user: User) => void;
  setUserRole: (role: Role) => void; // เพิ่ม
  logout: () => void;
}


const defaultUserContext: UserContextType = {
  user: null,
  setUserDetails: () => {},
  setUserRole: () => {},
  logout: () => {},
};


const UserContext = createContext<UserContextType>(defaultUserContext);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    firstname: "Test User",
    lastname: "Lastname",
    email: "test@gmail.com",
    role: "user", // default role
  });

  const setUserDetails = (userDetails: User) => {
    setUser(userDetails);
    localStorage.setItem("user", JSON.stringify(userDetails));
  };

  const setUserRole = (role: Role) => {
  if (!user) return;
  const updatedUser = { ...user, role };
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
  <UserContext.Provider value={{ user, setUserDetails, setUserRole, logout }}>
    {children}
  </UserContext.Provider>
);

};

export const useUser = () => useContext(UserContext);
