import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { VERIFY_TOKEN, REFRESH_TOKEN } from "./mutations";
import { client } from "../apolloClient";
import { PUBLIC_ROUTES } from "./routes";

// create a mechanism for authenticating each request that is sent
// 1. verify token that's stored in localStorage
// 1a. redirect to sign-in if there is no token stored
// 2. refresh token if exp is < 1min from now
// 2a. unset localStorage token & exp on logout
// 2b. call client.clearStore() on logout

export const AuthContext = React.createContext({
  token: null,
  updateToken: (token: any) => {}, // set default signature to expect function
  logout: () => {}
});

export function AuthProvider({ children }: { children: any }) {
  let navigate = useNavigate();
  let location = useLocation();

  // check localStorage for an auth token
  let storedToken = localStorage.getItem("auth-token");
  if (storedToken === "null") {
    storedToken = null;
  }
  const [token, setToken] = useState<string | null>(storedToken);

  function logout() {
    client.clearStore();
    localStorage.setItem("auth-token", JSON.stringify(null));
    localStorage.setItem("exp", JSON.stringify(null));
    setToken(null)
  }

  // check localStorage for an expiration datetime
  let storedExp: Date | string = localStorage.getItem("exp");
  if (storedExp === "null") {
    storedExp = null;
  }
  const [expDate, setExpDate] = useState<Date|string>(storedExp);

  const [refreshToken] = useMutation(REFRESH_TOKEN, {
    onCompleted: (data) => {
      localStorage.setItem("auth-token", data.refreshToken.token);
      setToken(data.refreshToken.token);
      const exp: Date = new Date(data.refreshToken.payload.exp * 1000);
      setExpDate(exp);
    },
    onError: (error) => console.error(error),
  });

  // if token is about to expire, refresh it
  function checkTokenExp() {
    let now: Date = new Date(Date.now());
    if (expDate) {
      // @ts-ignore
      const timeRemaining = expDate - now;
      const expiresSoon = timeRemaining > 0 && timeRemaining < 60000;
      if (expiresSoon) {
        refreshToken({ variables: { token } });
      }
    }
  }

  // every minute, check to see if token is about to expire
  setTimeout(() => {
    checkTokenExp();
  }, 60000);

  const [verifyToken] = useMutation(VERIFY_TOKEN, {
    onCompleted: (data) => {
      // use payload exp to set a countdown to refresh the token
      const exp: Date = new Date(data.verifyToken.payload.exp * 1000);
      // @ts-ignore
      localStorage.setItem("exp", exp);
      setExpDate(exp);
    },
    onError: (error) => {
      if (error.message === "Signature has expired") {
        // if token is expired, user must re-authenticate
        setToken(null);
        setExpDate(null);
        logout();
        navigate("/log-in");
      } else {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (!token && !PUBLIC_ROUTES.includes(location.pathname)) {
      navigate("/log-in");
    } else if (token) {
      verifyToken({ variables: { token } });
      checkTokenExp();
    }
  }, [token, location.pathname]);

  const auth = { token, updateToken: setToken, logout };

  return (
    <AuthContext.Provider value={auth as any}>{children}</AuthContext.Provider>
  );
}
