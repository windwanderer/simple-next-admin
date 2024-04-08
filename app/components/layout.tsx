"use client";
import { useRouter, useParams } from "next/navigation";
import { Layout, Dropdown, Space, ConfigProvider, theme } from "antd";
import zh_CN from "antd/locale/zh_CN";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { projectList } from "@/lib/const";
import { Navs } from "./nav";

const { Header, Content } = Layout;

export default function AppLayout({ children, menus }: any) {
  const router = useRouter();
  const params = useParams();

  const { slug } = params;

  const authMenus = JSON.parse(menus);
  const dropdownItems: MenuProps["items"] = [
    ...authMenus,
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ];

  const handleDropdownChange = ({ key }: any) => {
    // console.log(key);
    const validRoutes = Object.keys(projectList);
    if (key === "logout") {
      router.push("/logout");
    } else if (key === "accountManagement") {
      router.push(`/admin/admin`);
    } else if (key === "configManagement") {
      router.push(`/admin/config`);
    } else if (validRoutes.includes(key)) {
      router.push(`/${key}`);
    }
  };
  return (
    <ConfigProvider
      locale={zh_CN}
      theme={{
        token: {
          colorPrimary: "#0958d9",
        },
      }}
    >
      <Layout>
        <Header
          style={{ position: "sticky", top: 0, zIndex: 1, width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  padding: "0 40px 0 6px",
                  color: "#eee",
                }}
              >
                奈斯
              </span>
              {slug !== "admin" && <Navs></Navs>}
            </div>
            <div>
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm,
                }}
              >
                <Dropdown
                  menu={{
                    items: dropdownItems,
                    selectable: true,
                    defaultSelectedKeys: [slug as string],
                    onClick: (e) => handleDropdownChange(e),
                  }}
                >
                  <Space style={{ color: "#f0f0f0", cursor: "pointer" }}>
                    {projectList[slug as keyof typeof projectList]}
                    <UserOutlined />
                  </Space>
                </Dropdown>
              </ConfigProvider>
            </div>
          </div>
        </Header>
        <Layout style={{ minHeight: "100vh" }}>
          <Layout style={{ padding: "24px" }}>
            <Content
              style={{
                padding: 0,
                margin: 0,
                minHeight: 280,
                // background: "#112C53",
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
