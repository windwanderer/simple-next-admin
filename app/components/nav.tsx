"use client";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Menu } from "antd";
import type { MenuProps } from "antd";

export function Navs() {
  const pathname = usePathname();
  const params = useParams();

  const { slug } = params;
  const navs: MenuProps["items"] = [
    {
      key: `/${slug}/users`,
      label: <Link href={`/${slug}/users`}>会员列表</Link>,
    },
    {
      key: `/${slug}/visitors`,
      label: <Link href={`/${slug}/visitors`}>访客列表</Link>,
    },
    {
      key: `/${slug}/logs`,
      label: <Link href={`/${slug}/logs`}>日志列表</Link>,
    },
  ];
  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={[pathname]}
      items={navs}
    />
  );
}
