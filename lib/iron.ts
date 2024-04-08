import { SessionOptions } from "iron-session";

export interface SessionData {
  username: string;
  auth: string[];
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  username: "",
  auth: [],
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || '',
  cookieName: "nice-admin",
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production",
  },
};
