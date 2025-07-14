import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          {/* 添加更多路由 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
