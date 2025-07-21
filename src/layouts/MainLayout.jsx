import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useUserStore from '../store/userStore';

const MainLayout = () => {
  const { fetchUserProfile, token } = useUserStore();

  useEffect(() => {
    if (token) {
      // fetchUserProfile().catch(console.error); // This function is commented out in the store
    }
  }, [token, fetchUserProfile]);

  return (
    <>
      <Outlet />
    </>
  );
};

export default MainLayout;
