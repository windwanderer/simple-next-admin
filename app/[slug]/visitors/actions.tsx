"use server";
import { z } from "zod";
import clientPromise, { dbName } from "@/lib/mongodb";
import { projectList, projectKeys } from "@/lib/const";

const collectionName = "log";

const schema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(10),
  app: z.string().max(10).optional(),
  project: z.enum(projectKeys),
});

type Params = z.infer<typeof schema>;

export async function getVisitors(params: Params) {
  const validated = schema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
    app: params.app,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { page, pageSize, app, project } = validated.data;
  const title = projectList[project];
  const match: any = {
    title: title,
  };
  if (app) {
    match.app = app;
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const result = await db
      .collection(collectionName)
      .aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$clickId",
            count: { $sum: 1 },
            firstVisitTime: { $first: "$createTime" },
            app: { $first: "$app" },
            history: {
              $push: {
                // _id: "$_id",
                // title: "$title",
                action: "$action",
                value: "$value",
                createTime: "$createTime",
              },
            },
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            rows: [
              {
                $sort: {
                  firstVisitTime: -1,
                },
              },
              {
                $skip: page * pageSize - pageSize,
              },
              {
                $limit: pageSize,
              },
            ],
          },
        },
        {
          $project: {
            data: "$rows",
            total: { $arrayElemAt: ["$total.count", 0] },
          },
        },
      ])
      .toArray();
    const data = result[0].data.map((row: any) => {
      let duration = 0;
      let start = 0;
      let end = 0;
      row.history.forEach((h: any) => {
        if (h.action === "打开页面" || h.action === "查看页面") {
          start = new Date(h.createTime).getTime();
        } else if (h.action === "隐藏页面") {
          end = new Date(h.createTime).getTime();
          duration += Math.ceil((end - start) / 1000);
        }
      });
      return {
        ...row,
        duration,
      };
    });
    return {
      data: JSON.parse(JSON.stringify(data)),
      total: result[0].total,
      page: page,
      pageSize: pageSize,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "查询失败",
    };
  }
}

const schemaExport = z.object({
  app: z.string().max(10).optional(),
  project: z.enum(projectKeys),
});

type ParamsExport = z.infer<typeof schemaExport>;

export async function exportVisitors(params: ParamsExport) {
  const validated = schemaExport.safeParse({
    app: params.app,
    project: params.project,
  });
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return {
      error: "查询参数有误",
    };
  }
  const { app, project } = validated.data;
  const title = projectList[project];
  const match: any = {
    title: title,
  };
  if (app) {
    match.app = app;
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const result = await db
      .collection(collectionName)
      .aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$clickId",
            count: { $sum: 1 },
            firstVisitTime: { $first: "$createTime" },
            app: { $first: "$app" },
            history: {
              $push: {
                // _id: "$_id",
                // title: "$title",
                action: "$action",
                // value: "$value",
                createTime: "$createTime",
              },
            },
          },
        },
        {
          $sort: {
            firstVisitTime: -1,
          },
        },
      ])
      .toArray();
    const data = JSON.parse(JSON.stringify(result)).map(
      (row: any, index: number) => {
        let duration = 0;
        let start = 0;
        let end = 0;
        row.history.forEach((h: any) => {
          if (h.action === "打开页面" || h.action === "查看页面") {
            start = new Date(h.createTime).getTime();
          } else if (h.action === "隐藏页面") {
            end = new Date(h.createTime).getTime();
            duration += Math.ceil((end - start) / 1000);
          }
        });
        return [
          index + 1,
          row._id,
          row.app,
          row.firstVisitTime,
          row.count,
          duration,
        ];
      }
    );
    data.unshift([
      "序号",
      "ClickID",
      "APP",
      "初次访问时间",
      "日志数量",
      "停留时长（秒）",
    ]);
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
