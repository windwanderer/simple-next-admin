"use server";
import { z } from "zod";
import clientPromise, { dbName } from "@/lib/mongodb";
import { projectKeys } from "@/lib/const";

const schema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(10),
  keyword: z.string().max(50).optional(),
  app: z.string().max(10).optional(),
  project: z.enum(projectKeys),
});

const schemaExport = z.object({
  keyword: z.string().max(50).optional(),
  app: z.string().max(10).optional(),
  project: z.enum(projectKeys),
});

type Params = z.infer<typeof schema>;

type ParamsExport = z.infer<typeof schemaExport>;

export async function getUsers(params: Params) {
  const validated = schema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
    keyword: params.keyword,
    app: params.app,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { page, pageSize, keyword, app, project } = validated.data;
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    let findObj: any = {};
    if (keyword) {
      findObj = {
        $or: [
          {
            name: new RegExp(keyword as string, "i"),
          },
          {
            phone: new RegExp(keyword as string, "i"),
          },
        ],
      };
    }
    if (app) {
      findObj.app = app;
    }
    const users = await db
      .collection(project)
      .find(findObj)
      .sort({ $natural: -1 })
      .skip(page * pageSize - pageSize)
      .limit(pageSize)
      .toArray();
    const total = await db.collection(project).countDocuments(findObj);

    return {
      users: JSON.parse(JSON.stringify(users)),
      total: total,
      page: page,
      pageSize: pageSize,
      keyword: keyword,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}

export async function exportUsers(params: ParamsExport) {
  const validated = schemaExport.safeParse({
    keyword: params.keyword,
    app: params.app,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { keyword, app, project } = validated.data;
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    let findObj: any = {};
    if (keyword) {
      findObj = {
        $or: [
          {
            name: new RegExp(keyword as string, "i"),
          },
          {
            phone: new RegExp(keyword as string, "i"),
          },
        ],
      };
    }
    if (app) {
      findObj.app = app;
    }
    const users = await db
      .collection(project)
      .find(findObj)
      .sort({ $natural: -1 })
      .toArray();

    const data = JSON.parse(JSON.stringify(users)).map((row: any, index: number) => {
      return [index + 1, row.clickId, row.name, row.phone, row.app, row.createTime]
    })
    data.unshift(['序号','ClickID','姓名','电话','APP','提交时间'])

    return {
      data,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}
