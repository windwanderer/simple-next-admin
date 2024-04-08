"use client";
import { Button, Card, InputNumber, message } from "antd";
import { useEffect, useState } from "react";
import { getConfig, updateConfig } from "./actions";

export default function Config({ params }: { params: { slug: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [config, setConfig] = useState({
    juliang_callback_times: null,
  });
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  async function getData() {
    const data = await getConfig();
    // console.log(data);
    if (data.config) {
      setConfig(data.config);
    } else if (data.error) {
      messageApi.error(data.error);
    }
    // console.log("config", config);
  }
  function updateValue(value: number|null) {
    const obj = Object.assign({}, config, {
      juliang_callback_times: value
    })
    setConfig(obj)
  }
  async function handleUpdate() {
    setLoading(true);
    const result = await updateConfig(config);
    setLoading(false);
    if (result.success) {
      getData();
      messageApi.success("更新成功");
    } else {
      messageApi.error(result.error || "出错了");
    }
  }

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
        <h1 style={{ fontSize: 18 }}>配置管理</h1>
      </div>
      <Card style={{ width: 370 }}>
        <InputNumber
          addonBefore="用户页面操作"
          addonAfter="次时，回传巨量接口"
          value={config.juliang_callback_times}
          onChange={updateValue}
        />
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button onClick={handleUpdate} loading={loading} type="primary">
            确定更新
          </Button>
        </div>
      </Card>
    </div>
  );
}
