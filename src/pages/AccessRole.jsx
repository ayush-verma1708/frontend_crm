import { useState, useEffect } from 'react';
import './accessRole.css';
import Menubar from '../components/Menubar';
import AdminTable from '../components/AdminTable'; 
import AddAdminModal from '../modals/AddAdminModal';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

const AccessRole = () => {
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const addAdmin = async (adminDetails) => {
    const newAdmin = {
      id: uuidv4(),
      ...adminDetails,
    };
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminPanelCollectionRef = collection(db, 'adminPanel');
      
      setLoading(true);
  
      const unsubscribe = onSnapshot(adminPanelCollectionRef, (snapshot) => {
        const adminsList = [];
  
        snapshot.forEach((doc) => {
          // Directly get the fields from the document
          const adminData = doc.data();
  
          // Check if the document has the necessary fields
          if (adminData) {
            let magazines = [];
  
            if (adminData.magazine && Array.isArray(adminData.magazine)) {
              magazines = adminData.magazine.join(', ');  // Join the array into a comma-separated string
            }
  
            adminsList.push({
              uid: adminData.uid,
              name: adminData.name,
              email: adminData.email,
              accessRole: magazines,
              role: adminData.role,
            });
          }
        });
  
        setAdmins(adminsList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching admins:', error);
        setLoading(false);
      });
  
      return () => unsubscribe();
    };
  
    fetchAdmins();
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="accessRole-body">
      <Menubar heading="Access Role" />
      <div className="access-role-content">
        <AdminTable admins={admins} setAdmins={setAdmins} />
      </div>
      <i className="fa-solid fa-circle-plus addAdminIcon" onClick={() => setIsAddAdminModalOpen(true)}></i>
      {isAddAdminModalOpen && (
        <AddAdminModal setOpenAddAdminModal={setIsAddAdminModalOpen} addAdmin={addAdmin} />
      )}
    </div>
  );
};

export default AccessRole;