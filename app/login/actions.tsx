"use server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/mongodb";
import { defaultSession, sessionOptions, SessionData } from "@/lib/iron";

const collectionName = "admin";

export async function getSession(queryDb = true) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
    session.username = defaultSession.username;
    session.auth = defaultSession.auth;
  }

  if (queryDb) {
    const dbRes = await findUserInDb(session.username);
    const { userInDb } = dbRes;
    session.auth = userInDb?.auth || [];
  }

  return session;
}

export async function findUserInDb(username: string) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const userInDb: any = await db
      .collection(collectionName)
      .findOne({ username: username });
    // console.log(userInDb);
    return {
      userInDb,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}
