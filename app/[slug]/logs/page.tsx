"use client";
import {
  Space,
  Button,
  Table,
  Select,
  Radio,
  Tag,
  Tooltip,
  Input,
  message,
} from "antd";
import type { RadioChangeEvent } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import xlsx from "node-xlsx";
import { exportLogs, getLogs } from "./actions";
import { appSelectOptions, appTagColor } from "@/lib/const";

export default function Logs({ params }: { params: { slug: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [logs, setLogs] = useState([]);
  const [app, setApp] = useState("");
  const [hasValue, setHasValue] = useState(false);
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
      dataIndex: "clickId",
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    // {
    //   title: "项目名称",
    //   dataIndex: "title",
    // },
    {
      title: "APP",
      dataIndex: "app",
      render: (t: string) => {
        const color = appTagColor(t);
        return <Tag color={color}>{t}</Tag>;
      },
    },
    {
      title: "操作",
      dataIndex: "action",
    },
    {
      title: "操作值",
      dataIndex: "value",
    },
    {
      title: "操作时间",
      dataIndex: "createTime",
    },
    // {
    //   title: "操作",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <Typography.Link href={`/logs?openid=${record._id}`}>
    //         操作记录
    //       </Typography.Link>
    //     </Space>
    //   ),
    // },
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
  const handleValueChange = (e: RadioChangeEvent) => {
    setPage(1);
    setHasValue(e.target.value);
  };
  const onSearch = (value: string) => {
    console.log("onSearch", value);
    if (value !== keyword) {
      setPage(1);
    }
    setKeyword(value);
  };
  const exportExcel = async () => {
    setLoading(true);
    const res = await exportLogs({
      keyword,
      app,
      hasValue,
      project: params.slug as any,
    });
    console.log(res);
    const buffer = xlsx.build(
      [
        {
          name: "日志列表",
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
    a.download = "日志列表.xlsx";
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    setLoading(false);
  };

  useEffect(() => {
    const getData = async () => {
      const data = await getLogs({
        page,
        pageSize,
        keyword,
        app,
        hasValue,
        project: params.slug as any,
      });
      console.log(data);
      if (data.page) {
        setTotal(data.total || 0);
        setLogs(data.logs || []);
      } else if (data.error) {
        messageApi.error(data.error);
      }
      console.log("logs", logs, total, page, pageSize, keyword, app);
    };
    getData();
  }, [page, pageSize, keyword, app, hasValue]);

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
        <h1 style={{ fontSize: 18 }}>日志列表</h1>
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
          <div style={{ margin: "0 1em", display: "inline-block" }}>
            <Radio.Group value={hasValue} onChange={handleValueChange}>
              <Radio.Button value={false}>所有操作</Radio.Button>
              <Radio.Button value={true}>仅看数据</Radio.Button>
            </Radio.Group>
          </div>
          <Input.Search
            placeholder="请输入姓名或手机号搜索"
            onSearch={onSearch}
            allowClear
            enterButton
            style={{ width: "20em" }}
          />
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
        dataSource={logs}
        rowKey="_id"
        pagination={pagination}
      />
    </div>
  );
}
