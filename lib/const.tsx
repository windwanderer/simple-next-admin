type stringKey = Record<string, string>
export const projectList: stringKey = {
  suyan: "苏妍美妍",
  lingjiang: "南通领匠未来家网络科技有限公司",
};
export const projectKeys = Object.keys(projectList) as any as readonly [string, ...string[]]
export const appList = [
  "抖音极速版",
  "抖音火山版",
  "抖音",
  "西瓜视频",
  "今日头条",
  "番茄小说",
  "其他",
];
const appOptions = appList.map((item) => {
  return {
    label: item,
    value: item,
  };
});
export const appSelectOptions = [
  {
    value: "",
    label: "全部",
  },
  ...appOptions,
];
export function appTagColor(appName: string) {
  let color = "default";
  switch (appName) {
    case "抖音极速版":
      color = "blue";
      break;
    case "抖音火山版":
      color = "volcano";
      break;
    case "抖音":
      color = "purple";
      break;
    case "西瓜视频":
      color = "green";
      break;
    case "今日头条":
      color = "geekblue";
      break;
    case "番茄小说":
      color = "orange";
      break;
    case "其他":
      color = "default";
      break;
    default:
      break;
  }
  return color;
}
