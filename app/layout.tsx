import React from "react";
import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/antdRegistry";

import "./globals.css";

export const metadata: Metadata = {
  title: "奈斯-后台管理",
  description: "后台数据管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
