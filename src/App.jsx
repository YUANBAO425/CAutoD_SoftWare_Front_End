import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 布局
import DashboardLayout from './layouts/DashboardLayout';

// 页面
import LoginPage from './pages/LoginPage';
import CreateProjectPage from './pages/CreateProjectPage';
import useUserStore from './store/userStore';

// Placeholder pages for other routes
const PlaceholderPage = ({ title }) => <h1 className="text-2xl">{title}</h1>;

function App() {
  const { token } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {token ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/create-project" />} />
            <Route path="create-project" element={<CreateProjectPage />} />
            <Route path="geometry" element={<PlaceholderPage title="几何建模" />} />
            <Route path="parts" element={<PlaceholderPage title="零件检索" />} />
            <Route path="design-optimization" element={<PlaceholderPage title="设计优化" />} />
            <Route path="software-interface" element={<PlaceholderPage title="软件界面" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
