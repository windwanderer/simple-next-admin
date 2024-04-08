This is an web admin management system, including basic login and permission management, built with [Next.js](https://nextjs.org/).

+ next.js
+ mongodb
+ iron-session
+ antd
+ tailwind.css

## Development
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)。

### Configuration
Create a .env.local file in the root directory and configure the following:
```bash
SECRET_COOKIE_PASSWORD=

MONGODB_URI=
MONGODB_DB_NAME=
```

### Deployment
```bash
npm run build && npm run start
```

```bash
pm2 start npm --name "nc-admin" -- run start --watch --ignore-watch="node_modules,.git"
```

### Start mongod in authentication mode
```bash
mongod -dbpath /home/dev/mongodb/ --auth --bind_ip_all
```

Start with pm2：
```bash
pm2 start "mongod -dbpath /home/dev/mongodb/ --auth --bind_ip_all" --name "mongod"
```