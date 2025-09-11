"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useEffect,
} from "react";

// Define the type for the user details
interface User {
  firstname: string;
  lastname: string;
  email: string;
}

// Define the type for the context value
interface UserContextType {
  user: User | null;
  setUserDetails: (user: User) => void;
}

// Create the User Context with a default value
const defaultUserContext: UserContextType = {
  user: null,
  setUserDetails: () => {}, // No-op function
};

const UserContext = createContext<UserContextType>(defaultUserContext);

// Create a provider component
export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const setUserDetails = (userDetails: User) => {
    setUser(userDetails);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
