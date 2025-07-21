import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import useUserStore from './store/userStore';

function App() {
  const { token } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
