import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './app.css';
import LoginForm from './pages/LoginForm';
import Forgot from './pages/Forgot';
import SignupForm from './pages/SignupForm';
import Dashboard from './pages/Dashboard';
import Customer from './pages/Customer';
import Viewer from './pages/Viewer';
import AccessRole from './pages/AccessRole';
import SideNav from './components/SideNav';
import CustomerDetails from './components/CustomerDetails';
import AddData from './pages/AddData'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();

  const noSidebarPaths = ['/', '/LoginForm', '/SignupForm', '/Forgot'];

  const role = localStorage.getItem('role');

  return (
    <div className='page'>
      {!noSidebarPaths.includes(location.pathname) && <SideNav />}
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<LoginForm />} />
        <Route path='/records/:id' element={<CustomerDetails />} />
        <Route path='/LoginForm' element={<LoginForm />} />
        <Route path='/Forgot' element={<Forgot />} />
        <Route path='/SignupForm' element={<SignupForm />} />

        {/* Private Routes */}
        <Route
          path='/Dashboard'
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/Add-data'
          element={
            <ProtectedRoute allowedRoles={['Owner']}>
              <AddData />
            </ProtectedRoute>
          }
        />
        <Route
          path='/Customer'
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path='/Viewer'
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
              <Viewer />
            </ProtectedRoute>
          }
        />
        <Route
          path='/AccessRole'
          element={
            <ProtectedRoute allowedRoles={['Owner']}>
              <AccessRole />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;