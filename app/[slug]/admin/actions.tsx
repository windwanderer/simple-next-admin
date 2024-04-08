"use server";
import clientPromise, { dbName } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/iron";

export async function getAdmin() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const admin = await db
      .collection("admin")
      .find()
      // .sort({ $natural: -1 })
      .toArray();
    const result = admin.map((el) => {
      delete el.password;
      return el;
    });
    return {
      admin: JSON.parse(JSON.stringify(result)),
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}
export async function insertOne(obj: any) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const result = await db.collection("admin").insertOne(obj);
    // console.log(result.insertedId)
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "新增失败",
    };
  }
}
export async function updateOne(obj: any) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const result = await db.collection("admin").updateOne(
      {
        username: obj.username,
      },
      {
        $set: obj,
      }
    );
    // console.log(result);
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "修改失败",
    };
  }
}
export async function deleteOne(username: string) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const result = await db.collection("admin").deleteOne({
      username: username,
    });
    // console.log(result);
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "修改失败",
    };
  }
}
