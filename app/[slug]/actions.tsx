"use server";
import { z } from "zod";
import clientPromise, { dbName } from "@/lib/mongodb";

const collectionName = "log";

const schema = z.string().min(1);
type Params = z.infer<typeof schema>;

export async function getClickIdHistory(param: Params) {
  const validated = schema.safeParse(param);
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const clickId = validated.data;
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const findObj = {
      clickId: clickId,
    };
    const clickLogs: any = await db
      .collection(collectionName)
      .find(findObj)
      .sort({ $natural: -1 })
      .toArray();
    // console.log(clickLogs);
    return {
      result: JSON.parse(JSON.stringify(clickLogs)),
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}
