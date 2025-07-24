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
|   .gitignore
|   components.json
|   eslint.config.js
|   index.html
|   package-lock.json
|   package.json
|   postcss.config.js
|   README.md
|   tailwind.config.js
|   vite.config.js
|
+---public
|       vite.svg
|
+---rules
\---src
    |   App.jsx
    |   index.css
    |   main.jsx
    |
    +---api
    |       authAPI.js
    |       dashboardAPI.js
    |       designOptimizationAPI.js
    |       fileAPI.js
    |       geometricModelingAPI.js
    |       index.js
    |       partRetrievalAPI.js
    |       softwareInterfaceAPI.js
    |
    +---assets
    |       google-logo.svg
    |       google_logo_icon_169090.svg
    |       react.svg
    |
    +---components
    |   |   ChatInput.jsx
    |   |
    |   \---ui
    |           avatar.jsx
    |           button.jsx
    |           card.jsx
    |           checkbox.jsx
    |           dialog.jsx
    |           dropdown-menu.jsx
    |           input.jsx
    |
    +---hooks
    +---layouts
    |       DashboardLayout.jsx
    |       MainLayout.jsx
    |
    +---lib
    |       utils.js
    |
    +---mocks
    |       authMock.js
    |       dashboardMock.js
    |       designOptimizationMock.js
    |       fileMock.js
    |       geometricModelingMock.js
    |       partRetrievalMock.js
    |       softwareInterfaceMock.js
    |
    +---pages
    |       CreateProjectPage.jsx
    |       DesignOptimizationPage.jsx
    |       GeometricModelingPage.jsx
    |       HistoryPage.jsx
    |       LoginPage.jsx
    |       PartRetrievalPage.jsx
    |       SoftwareInterfacePage.jsx
    |
    +---store
    |       userStore.js
    |
    \---utils
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
