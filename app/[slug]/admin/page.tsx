"use client";
import {
  Space,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { getAdmin, insertOne, updateOne, deleteOne } from "./actions";
import { projectList } from "@/lib/const";

export default function Admin({ params }: { params: { slug: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [admin, setAdmin] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [form] = Form.useForm();

  const authSelectOptions = Object.keys(projectList).map((key) => {
    return {
      label: projectList[key],
      value: key,
    };
  });

  const columns: ColumnsType<any> = [
    {
      title: "序号",
      dataIndex: "_id",
      width: 90,
      render: (value, record, index) => {
        return index + 1;
      },
    },
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "项目权限",
      dataIndex: "auth",
      render: (t: []) => {
        return (
          <>
            {t.map((el) => (
              <Tag key={el}>{projectList[el]}</Tag>
            ))}
          </>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (t: boolean) => {
        return <Tag color={t ? "green" : "red"}>{t ? "正常" : "冻结"}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => openPasswordModal(record)}>
            重置密码
          </Button>
          {record.username !== "admin" && (
            <Popconfirm
              title="删除账号"
              description="确定删除该账号？"
              onConfirm={() => confirmDelete(record.username)}
              okText="删除"
              cancelText="取消"
            >
              <Button type="link">删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const getData = async () => {
    const data = await getAdmin();
    console.log(data);
    if (data.admin) {
      setAdmin(data.admin || []);
    } else if (data.error) {
      messageApi.error(data.error);
    }
    console.log("admin", admin);
  };
  const openNewModal = () => {
    form.resetFields();
    setModalTitle("新增账号");
    setIsModalOpen(true);
  };
  const openEditModal = (record: {}) => {
    form.resetFields();
    form.setFieldsValue(record);
    setModalTitle("编辑账号");
    setIsModalOpen(true);
  };
  const openPasswordModal = (record: {}) => {
    form.resetFields();
    form.setFieldsValue(record);
    setModalTitle("重置密码");
    setIsModalOpen(true);
  };
  const onFinish = async (values: {}) => {
    console.log(values);
    setLoading(true);
    let result: any = {
      success: false,
      error: null,
    };
    if (modalTitle === "新增账号") {
      result = await insertOne(values);
    } else if (modalTitle === "编辑账号") {
      result = await updateOne(values);
    } else if (modalTitle === "重置密码") {
      result = await updateOne(values);
    }
    setLoading(false);
    if (result.success) {
      getData();
      messageApi.success(modalTitle + "成功");
      setIsModalOpen(false);
    } else {
      messageApi.error(result.error || "出错了");
    }
  };
  const confirmDelete = async (username: string) => {
    if (loading) return;
    setLoading(true);
    const result = await deleteOne(username);
    setLoading(false);
    if (result.success) {
      getData();
      messageApi.success("删除成功");
    } else {
      messageApi.error(result.error || "出错了");
    }
  };

  useEffect(() => {
    if (!pageLoaded) {
      getData();
      setPageLoaded(true);
    }
  }, [pageLoaded]);

  return (
    <div>
      {contextHolder}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ fontSize: 18 }}>
          账号管理
        </h1>
        <div>
          <Space.Compact>
            <Button type="primary" onClick={openNewModal}>
              新增账号
            </Button>
          </Space.Compact>
        </div>
      </div>
      <Table columns={columns} dataSource={admin} rowKey="_id" pagination={false} />

      <Modal
        title={modalTitle}
        footer={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        <div
          style={{ maxHeight: 400, paddingTop: 20, overflow: "hidden auto" }}
        >
          <Form
            labelCol={{ span: 6 }}
            form={form}
            name="control-hooks"
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true }]}
            >
              <Input disabled={modalTitle !== "新增账号"} />
            </Form.Item>
            {modalTitle !== "编辑账号" && (
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            )}
            {modalTitle !== "重置密码" && (
              <>
                <Form.Item name="phone" label="手机号">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="auth"
                  label="项目"
                  rules={[{ required: true }]}
                >
                  <Select mode="multiple" options={authSelectOptions} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="状态"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="正常" unCheckedChildren="冻结" />
                </Form.Item>
              </>
            )}
            <Form.Item wrapperCol={{ offset: 16, span: 8 }}>
              <Space>
                <Button htmlType="button" onClick={() => setIsModalOpen(false)}>
                  取消
                </Button>
                <Button type="primary" loading={loading} htmlType="submit">
                  提交
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
