import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearAuthorization, setAuthorization } from "../api/client";
import { LoginDialog } from "../components/LoginDialog";

export interface Session {
  username: string;
  roles: string[];
}

interface AuthValue {
  session: Session | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loginOuvert, setLoginOuvert] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setAuthorization(username, password);
    try {
      const moi = await api.me();
      setSession({
        username: moi.username,
        roles: moi.roles.map((role) => role.replace(/^ROLE_/, "")),
      });
    } catch (erreur) {
      clearAuthorization();
      throw erreur;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthorization();
    setSession(null);
  }, []);

  const valeur = useMemo<AuthValue>(() => {
    return {
      session,
      login,
      logout,
      openLogin: () => setLoginOuvert(true),
      closeLogin: () => setLoginOuvert(false),
      hasRole: (...roles) => (session ? roles.some((role) => session.roles.includes(role)) : false),
    };
  }, [session, login, logout]);

  return (
    <AuthContext.Provider value={valeur}>
      {children}
      <LoginDialog open={loginOuvert} onClose={() => setLoginOuvert(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return contexte;
}
