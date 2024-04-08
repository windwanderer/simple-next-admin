"use server";
import clientPromise, { dbName } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/iron";

export async function getConfig() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const res = await db.collection("config").find().toArray();
    let obj = {};
    res.forEach((el: any) => {
      delete el._id;
      obj = Object.assign({}, obj, el);
    });
    return {
      config: JSON.parse(JSON.stringify(obj)),
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}
export async function updateConfig(obj: any) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (session.username !== "admin") {
    return {
      error: "无权限",
    };
  }
  console.log(obj)
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const findObj: any = {};
    Object.keys(obj).forEach((key) => {
      findObj[key] = { $exists: true };
    });
    const result = await db.collection("config").updateOne(findObj, {
      $set: obj,
    });
    // console.log(result);
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "更新失败",
    };
  }
}
