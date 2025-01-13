import './navLogout.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import LogoutModal from '../modals/LogoutModal';

export default function NavLogout({iconName}) {
    const [openLogoutModal, setOpenLogoutModal] = useState(false);

    const navigate = useNavigate();

    const confirmLogout = async () => {
        try {
            // Sign out using Firebase Authentication
            await signOut(auth);

            // Clear local and session storage (optional)
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('userSession');

            // Navigate to the login page
            navigate('/LoginForm');

            // Prevent the user from going back to the dashboard after logging out
            window.history.replaceState(null, null, window.location.href); // Replaces the current entry in the history stack
            window.onpopstate = function () {
                navigate('/LoginForm'); // Forces navigation to login when back is pressed
            };
            
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="navLogout">
            <span onClick={()=> setOpenLogoutModal(true)}>
                <i className="fa-solid fa-arrow-right-from-bracket fa-rotate-180"></i>
                <span id="icon-name">{iconName}</span>
            </span>
            {openLogoutModal && <LogoutModal setOpenLogoutModal={setOpenLogoutModal}
             confirmLogout={confirmLogout}/>}
        </div>
    );
}