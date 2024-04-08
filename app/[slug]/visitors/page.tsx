"use client";
import {
  Space,
  Button,
  Table,
  Select,
  Tag,
  Tooltip,
  Modal,
  Timeline,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import xlsx from "node-xlsx";
import { exportVisitors, getVisitors } from "./actions";
import { appSelectOptions, appTagColor } from "@/lib/const";

export default function Visitors({ params }: { params: { slug: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [visitors, setVisitors] = useState([]);
  const [app, setApp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickHistory, setClickHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns: ColumnsType<any> = [
    {
      title: "序号",
      dataIndex: "_id",
      width: 90,
      render: (value, record, index) => {
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "ClickID",
      dataIndex: "_id",
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: "APP",
      dataIndex: "app",
      render: (t: string) => {
        const color = appTagColor(t);
        return <Tag color={color}>{t}</Tag>;
      },
    },
    {
      title: "初次访问时间",
      dataIndex: "firstVisitTime",
    },
    {
      title: "日志数量",
      dataIndex: "count",
    },
    {
      title: "停留时长（秒）",
      dataIndex: "duration",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openDetail(record.history)}>
            操作记录
          </Button>
        </Space>
      ),
    },
  ];
  const pagination = {
    pageSize: pageSize || 10,
    current: page || 1,
    total: total,
    showSizeChanger: true,
    showTotal: (total: number) => {
      return `共 ${total} 条`;
    },
    onChange: (newPage: number, newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPage(1);
      } else {
        setPage(newPage);
      }
      setPageSize(newPageSize);
    },
  };
  const handleAppChange = (value: string) => {
    setPage(1);
    setApp(value);
  };
  const exportExcel = async () => {
    setLoading(true);
    const res = await exportVisitors({
      app,
      project: params.slug as any,
    });
    console.log(res);
    const buffer = xlsx.build(
      [
        {
          name: "访客列表",
          options: {},
          data: res.data,
        },
      ],
      {}
    );
    const blob = new Blob([buffer]);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "访客列表.xlsx";
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    setLoading(false);
  };
  const exportHistory = () => {
    const data = clickHistory.map((row: any, index) => {
      return [index + 1, row.children, row.label];
    });
    data.unshift(["序号", "操作", "操作时间"]);
    const buffer = xlsx.build(
      [
        {
          name: "操作历史",
          options: {},
          data: data,
        },
      ],
      {}
    );
    const blob = new Blob([buffer]);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "操作历史.xlsx";
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    setLoading(false);
  };

  async function openDetail(history: any) {
    const clickHistory = history.map((el: any) => {
      let children = el.action;
      if (el.value) {
        children += "：" + el.value;
      }
      return {
        label: el.createTime,
        children: children,
      };
    });
    setClickHistory(clickHistory);
    setIsModalOpen(true);
  }

  useEffect(() => {
    const getData = async () => {
      const data = await getVisitors({
        page,
        pageSize,
        app,
        project: params.slug as any,
      });
      console.log(data);
      if (data.page) {
        setTotal(data.total || 0);
        setVisitors(data.data || []);
      } else if (data.error) {
        messageApi.error(data.error);
      }
      console.log("visitors", visitors, total, page, pageSize, app);
    };
    getData();
  }, [page, pageSize, app]);

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
        <h1 style={{ fontSize: 18 }}>访客列表</h1>
        <div>
          <Space.Compact>
            <Button
              disabled
              style={{
                color: "rgba(0, 0, 0, 0.88)",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
                cursor: "default",
              }}
            >
              APP
            </Button>
            <Select
              defaultValue=""
              onChange={handleAppChange}
              options={appSelectOptions}
              style={{ width: "9em" }}
            />
          </Space.Compact>
          <Button
            type="primary"
            loading={loading}
            style={{
              marginLeft: "1em",
            }}
            onClick={exportExcel}
          >
            导出
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={visitors}
        rowKey="_id"
        pagination={pagination}
      />

      <Modal
        title="操作历史"
        open={isModalOpen}
        okText="导出"
        onCancel={() => setIsModalOpen(false)}
        onOk={exportHistory}
        footer={(_, { OkBtn }) => <OkBtn />}
      >
        <div
          style={{ maxHeight: 400, paddingTop: 20, overflow: "hidden auto" }}
        >
          <Timeline mode="left" items={clickHistory} />
        </div>
      </Modal>
    </div>
  );
}
