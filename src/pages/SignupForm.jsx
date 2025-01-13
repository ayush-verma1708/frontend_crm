import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import './signup.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, setDoc } from 'firebase/firestore';

const SignupForm = () => {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const addUserToFirestore = async (userId, email, name) => {
    try {
      const userRef = doc(db, 'adminPanel', userId);
      const magazines = ['ALPHERO', 'BLACKCRUZE', 'BLAZE', 'CON', 'ENVY',
        'MAC', 'MAGBLACK', 'MIRROR', 'UNCOVER', 'WILL'];
      
      await setDoc(userRef, {
          magazine: magazines,
          email,
          name,
          role: 'Owner',
          uid: userId
      });
      console.log('User added to Firestore');
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
    }
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (key !== 'xDhyzPLa') {
      toast.error('Secret key does not match');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addUserToFirestore(userCredential.user.uid, email, name);

      toast.success('Signup successful. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error during signup:', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-center" />
      <div className="signup-form">
        <h2 className="signup-head">Create Account</h2>
        <form onSubmit={signUp}>
          <label className="signup-label">
            Secret Key
            <input
              className="signup-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter secret key"
              required
            />
          </label>
          <label className="signup-label">
            Name
            <input
              className="signup-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </label>
          <label className="signup-label">
            Email
            <input
              className="signup-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
          <label className="signup-label">
            Password
            <input
              className="signup-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password"
              required
            />
          </label>
          <button type="submit" className="signupBtn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <div className="signup-optn">
          Already have an account? <a href="./">Login</a>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;