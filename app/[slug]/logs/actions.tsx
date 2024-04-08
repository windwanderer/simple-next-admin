"use server";
import { z } from "zod";
import clientPromise, { dbName } from "@/lib/mongodb";
import { projectList, projectKeys } from "@/lib/const";

const collectionName = "log";

const schema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(10),
  keyword: z.string().max(50).optional(),
  app: z.string().max(10).optional(),
  hasValue: z.boolean(),
  project: z.enum(projectKeys),
});

type Params = z.infer<typeof schema>;

export async function getLogs(params: Params) {
  const validated = schema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
    keyword: params.keyword,
    app: params.app,
    hasValue: params.hasValue,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { page, pageSize, keyword, app, hasValue, project } = validated.data;
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    let findObj: any = {
      title: projectList[project],
    };
    if (keyword) {
      findObj["$or"] = [
        {
          name: new RegExp(keyword as string, "i"),
        },
        {
          phone: new RegExp(keyword as string, "i"),
        },
      ];
    }
    if (app) {
      findObj.app = app;
    }
    if (hasValue) {
      findObj.value = new RegExp(/.+/, "i");
    }

    const logs = await db
      .collection(collectionName)
      .find(findObj)
      .sort({ $natural: -1 })
      .skip(page * pageSize - pageSize)
      .limit(pageSize)
      .toArray();
    const total = await db.collection(collectionName).countDocuments(findObj);

    return {
      logs: JSON.parse(JSON.stringify(logs)),
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

const schemaExport = z.object({
  keyword: z.string().max(50).optional(),
  app: z.string().max(10).optional(),
  hasValue: z.boolean(),
  project: z.enum(projectKeys),
});

type ParamsExport = z.infer<typeof schemaExport>;

export async function exportLogs(params: ParamsExport) {
  const validated = schemaExport.safeParse({
    keyword: params.keyword,
    app: params.app,
    hasValue: params.hasValue,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { keyword, app, hasValue, project } = validated.data;
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    let findObj: any = {
      title: projectList[project],
    };
    if (keyword) {
      findObj["$or"] = [
        {
          name: new RegExp(keyword as string, "i"),
        },
        {
          phone: new RegExp(keyword as string, "i"),
        },
      ];
    }
    if (app) {
      findObj.app = app;
    }
    if (hasValue) {
      findObj.value = new RegExp(/.+/, "i");
    }

    const logs = await db
      .collection(collectionName)
      .find(findObj)
      .sort({ $natural: -1 })
      .toArray();

    const data = JSON.parse(JSON.stringify(logs)).map(
      (row: any, index: number) => {
        return [
          index + 1,
          row.clickId,
          row.app,
          row.action,
          row.value,
          row.createTime,
        ];
      }
    );
    data.unshift(["序号", "ClickID", "APP", "操作", "操作值", "提交时间"]);
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
