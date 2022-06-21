import service from "../common/service";
import React, { useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

interface AuthContextType {
  user?: string;
  signin: (user: string, pass: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<string>();
  let navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/signin", { replace: true });
    else navigate("/", { replace: true });
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      service
        .get("/api/user/me")
        .then((res) => {
          setUser(res.data.user.username);
        })
        .catch(() => {
          // no-op
        });
    }
  }, []);

  let signin = async (username: string, password: string) => {
    const res = await service.post("/api/user/signin", {
      username,
      password,
    });
    if (!res.data.auth) return;
    const token = res.data.token as string;

    localStorage.setItem("token", token);
    setUser(username);
  };

  let signout = async () => {
    localStorage.setItem("token", "");
    setUser(undefined);
  };

  let register = async (username: string, password: string) => {
    const res = await service.post("/api/user/register", {
      username,
      password,
    });
    if (!res.data.auth) return;
    const token = res.data.token as string;

    localStorage.setItem("token", token);
    setUser(username);
  }

  let value = { user, signin, signout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
