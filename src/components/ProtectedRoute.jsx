import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Firebase auth

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/LoginForm');
      } else {
        const role = localStorage.getItem('role'); // Get user role
        if (!allowedRoles.includes(role)) {
          // Redirect if role is not allowed
          navigate('/Dashboard'); // Fallback page for unauthorized access
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, allowedRoles]);

  return children; // Render the protected content if role matches
};

export default ProtectedRoute;