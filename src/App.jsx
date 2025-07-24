import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 布局
import DashboardLayout from './layouts/DashboardLayout';

// 页面
import LoginPage from './pages/LoginPage';
import CreateProjectPage from './pages/CreateProjectPage';
import GeometricModelingPage from './pages/GeometricModelingPage';
import PartRetrievalPage from './pages/PartRetrievalPage';
import DesignOptimizationPage from './pages/DesignOptimizationPage';
import SoftwareInterfacePage from './pages/SoftwareInterfacePage';
import HistoryPage from './pages/HistoryPage';
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
            <Route path="geometry" element={<GeometricModelingPage />} />
            <Route path="parts" element={<PartRetrievalPage />} />
            <Route path="design-optimization" element={<DesignOptimizationPage />} />
            <Route path="software-interface" element={<SoftwareInterfacePage />} />
            <Route path="history" element={<HistoryPage />} />
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
