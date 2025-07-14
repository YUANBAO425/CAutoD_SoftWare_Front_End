# CAutoD 前端项目

基于React 18+、Tailwind CSS和Zustand的现代前端项目。

## 技术栈

- **React 18+** - 使用JavaScript，不使用TypeScript
- **Tailwind CSS** - 响应式样式设计
- **shadcn/ui** - 基于Radix UI的组件库（待集成）
- **Zustand** - 状态管理
- **React Router** - 路由管理

## 项目结构

```
front_end/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── api/             # API服务和请求封装
│   ├── assets/          # 图片、字体等资源
│   ├── components/      # 可复用组件
│   ├── hooks/           # 自定义React Hooks
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面组件
│   ├── store/           # Zustand状态管理
│   ├── utils/           # 工具函数
│   ├── App.jsx          # 应用入口组件
│   ├── main.jsx         # 主入口文件
│   └── index.css        # 全局样式
├── .gitignore           # Git忽略配置
├── index.html           # HTML模板
├── package.json         # 项目依赖配置
├── postcss.config.js    # PostCSS配置
├── tailwind.config.js   # Tailwind CSS配置
└── vite.config.js       # Vite配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码规范检查

```bash
npm run lint
```

## 开发规范

1. 所有API请求封装在`src/api`目录中
2. 组件嵌套层级不超过三层
3. 使用Zustand管理全局状态
4. 遵循DRY和KISS原则
5. 保持代码风格一致性
