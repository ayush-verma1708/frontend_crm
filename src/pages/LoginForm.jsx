import './login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import 'react-toastify/dist/ReactToastify.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Function to fetch user data after login
  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'adminPanel', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        const magazine = userDoc.data().magazine;

        // Save in localStorage
        localStorage.setItem('role', role);
        localStorage.setItem('magazine', JSON.stringify(magazine));
      } else {
        toast.error('No user data found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching user data: ', error);
      toast.error('Failed to fetch user data.');
    }
  };

  const signIn = async (e) => {
    e.preventDefault();
    try {
      // Sign in user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Store the token locally
      localStorage.setItem('token', userCredential.user.accessToken);
      
      // Fetch user data from Firestore
      await fetchUserData(userCredential.user.uid);

      // Show success toast and navigate
      toast.success('Login successful. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000);

    } catch (error) {
      toast.error('Failed to log in. Please check your email and password.');
    }
  };

  return (
    <div className='login-container'>
      <ToastContainer position="top-center" />
      <form className='login-form' onSubmit={signIn}>
        <h2 className='login-heading'> Login </h2>
        <label className='login-label'>
          Email
          <input
            className='login-input'
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className='login-label'>
          Password
          <input
            className='login-input'
            type='password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div>
          <a href='/Forgot' className='forgot-pw'>Forgot Password?</a>
        </div>
        <button type='submit'>Login</button>
        <div className='login-optn'>Don&apos;t have an account? <a href='/SignupForm'>Sign Up</a></div>
      </form>
    </div>
  );
}

export default LoginForm;
