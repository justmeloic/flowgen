import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarURL: string;
}

// Define the context value type (includes user data and update function)
interface UserContextValue {
  user: User | null;
  updateUser: (newUser: User | null) => void; // Allow setting to null for logout
  loading: boolean; // Add a loading state
}

// Create the context with a default value (no user, and a no-op update function)
const UserContext = createContext<UserContextValue>({
  user: null,
  updateUser: () => {},
  loading: true,
});

// Custom hook for easy access to the context
export const useUser = () => useContext(UserContext);

// UserProvider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchmockUser = async () => {
      try {
        const response = await fetch("/data/mockUser.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching initial user data:", error);
        // Handle the error - maybe set a default user or show an error message
        setUser(null); // Or a default user if you have one
      } finally {
        setLoading(false);
      }
    };

    fetchmockUser();
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
