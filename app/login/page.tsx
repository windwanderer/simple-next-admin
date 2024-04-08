"use client";
// import { useRouter } from "next/navigation";
import React from "react";
import { Card, Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";

type FieldType = {
  username?: string;
  password?: string;
};

export default function Login() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    console.log("Success:", values);

    const res = await fetch("/admin/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    console.log("data", data);
    if (data.error) {
      messageApi.error(data.error);
    } else {
      messageApi.success("登录成功！");
      router.push(data.redirect);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background:
          "radial-gradient(circle, rgba(0,212,255,1) 0%, rgba(9,9,121,1) 40%, rgba(2,0,36,1) 100%)",
      }}
    >
      <Card title="奈斯互联网数据管理后台" headStyle={{textAlign: 'center', fontSize: 24}} bordered={false} style={{ width: 400 }}>
        {contextHolder}
        <Form
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ md: { offset: 6, span: 18 } }}>
            <Button type="primary" block={true} htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
