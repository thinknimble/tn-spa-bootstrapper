import { useMutation } from "@apollo/client";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { client } from "../apolloClient";
import { REFRESH_TOKEN, VERIFY_TOKEN } from "./mutations";
import { PUBLIC_ROUTES } from "./routes";

// create a mechanism for authenticating each request that is sent
// 1. verify token that's stored in localStorage
// 1a. redirect to sign-in if there is no token stored
// 2. refresh token if exp is < 1min from now
// 2a. unset localStorage token & exp on logout
// 2b. call client.clearStore() on logout

const appName = process.env["REACT_APP_NAME"];
const AUTH_TOKEN_KEY = `${appName}-auth-token`;
const EXPIRATION_DATE_KEY = `${appName}-exp`;
const TOKEN_CHECK_INTERVAL_MS = 60000;
const REFRESH_THRESHOLD = 60000;

const useInterval = (fn: () => void, intervalMs: number) => {
  useEffect(() => {
    const intervalId = setInterval(fn, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [fn, intervalMs]);
};

type AuthState = {
  token: string | null;
  updateToken: (token: string) => void;
};

export const AuthContext = React.createContext<AuthState>({
  token: null,
  updateToken: (token) => {}, // set default signature to expect function
});

export function logout() {
  client.clearStore();
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(EXPIRATION_DATE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // check localStorage for an auth token
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const [token, setToken] = useState(storedToken);

  //sync react with external system
  useEffect(() => {
    token && localStorage.setItem(AUTH_TOKEN_KEY, token);
  }, [token]);

  // check localStorage for an expiration datetime
  const [refreshToken] = useMutation(REFRESH_TOKEN, {
    onCompleted: (data) => {
      setToken(data.refreshToken.token);
      const exp: Date = new Date(data.refreshToken.payload.exp * 1000);
      localStorage.setItem(EXPIRATION_DATE_KEY, exp.toISOString());
    },
    onError: (error) => console.error(error),
  });

  // if token is about to expire, refresh it
  const checkTokenExpiration = useCallback(() => {
    const storedExpDate = localStorage.getItem(EXPIRATION_DATE_KEY);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedExpDate && storedToken) {
      const expDate = new Date(storedExpDate);
      const timeRemaining = expDate.valueOf() - Date.now();
      const expiresSoon =
        timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD;
      expiresSoon && refreshToken({ variables: { storedToken } });
    }
  }, [refreshToken]);

  // every minute, check to see if token is about to expire
  useInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL_MS);

  const [verifyToken] = useMutation(VERIFY_TOKEN, {
    onCompleted: (data) => {
      // use payload exp to set a countdown to refresh the token
      const exp: Date = new Date(data.verifyToken.payload.exp * 1000);
      localStorage.setItem(EXPIRATION_DATE_KEY, exp.toISOString());
    },
    onError: (error) => {
      if (error.message === "Signature has expired") {
        // if token is expired, user must re-authenticate
        setToken(null);
        localStorage.removeItem(EXPIRATION_DATE_KEY);
        logout();
        navigate("/log-in");
      } else {
        console.error(error);
      }
    },
  });

  //restrict private rutes
  useEffect(() => {
    if (!token && !PUBLIC_ROUTES.includes(location.pathname)) {
      navigate("/log-in");
    } else if (token) {
      verifyToken({ variables: { token } });
      checkTokenExpiration();
    }
  }, [token, location.pathname, checkTokenExpiration, navigate, verifyToken]);

  const auth = { token, updateToken: setToken };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
