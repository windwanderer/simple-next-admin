import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/iron";
import { findUserInDb } from "@/app/login/actions";

const schema = z.object({
  username: z.string().min(1).max(20),
  password: z.string().min(1).max(20),
});

// type Params = z.infer<typeof schema>;

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  // console.log('session', session)
  const body = await request.json();
  // console.log("request", body);
  const validated = schema.safeParse({
    username: body?.username,
    password: body?.password,
  });
  if (!validated.success) {
    // console.log(validated.error.flatten().fieldErrors);
    return Response.json({
      error: "参数有误",
    });
  }
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const { username, password } = validated.data;
  const dbRes = await findUserInDb(username);
  const { error, userInDb } = dbRes;
  // console.log(userInDb);
  if (error) {
    return Response.json({
      error: error,
    });
  } else if (!userInDb) {
    return Response.json({
      error: "用户不存在",
    });
  } else if (userInDb?.password !== password) {
    return Response.json({
      error: "密码错误",
    });
  } else if (!userInDb?.status) {
    return Response.json({
      error: "用户已冻结",
    });
  } else if (userInDb?.auth?.length < 1) {
    return Response.json({
      error: "当前用户无权限",
    });
  } else {
    session.isLoggedIn = true;
    session.username = userInDb?.username;
    session.auth = userInDb?.auth || [];
    await session.save();
    const path = userInDb?.auth[0];
    const url = `/${path}`;
    revalidatePath("/", "layout");
    return Response.json({
      redirect: url,
      success: true,
    });
  }
}
