这是一个简单的Admin管理后台，包含基本的登录和权限管理，使用[Next.js](https://nextjs.org/) 构建。

+ next.js
+ mongodb
+ iron-session
+ antd
+ tailwind.css

## 开发
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

### 配置
根目录新建.env.local文件，并配置以下内容
```bash
SECRET_COOKIE_PASSWORD=

MONGODB_URI=
MONGODB_DB_NAME=
```

### 部署
```bash
npm run build && npm run start
```

```bash
pm2 start npm --name "nc-admin" -- run start --watch --ignore-watch="node_modules,.git"
```

### 启动mongod，认证模式
```bash
mongod -dbpath /home/dev/mongodb/ --auth --bind_ip_all
```

用pm2启动：
```bash
pm2 start "mongod -dbpath /home/dev/mongodb/ --auth --bind_ip_all" --name "mongod"
```