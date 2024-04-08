import React from "react";
import { redirect } from "next/navigation";
import AppLayout from "@/app/components/layout";
import { getSession } from "@/app/login/actions";
import { projectList } from "@/lib/const";

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getSession();
  // console.log(session);
  const isAdmin = session.username === "admin";
  const hasAuth = isAdmin || session?.auth?.includes(params.slug);
  if (!session.isLoggedIn || !hasAuth) {
    redirect("/logout");
  }
  let menus: any = session?.auth.map((key) => {
    return {
      key: key,
      label: projectList[key as keyof typeof projectList],
    };
  });
  if (isAdmin) {
    menus = menus.concat([
      {
        type: "divider",
      },
      {
        key: "accountManagement",
        label: "账号管理",
      },
      {
        key: "configManagement",
        label: "配置管理",
      },
    ]);
  }
  return <AppLayout menus={JSON.stringify(menus)}>{children}</AppLayout>;
}
