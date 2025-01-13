import './adminTable.css';
import DeleteAdminModal from '../modals/DeleteAdminModal';
import { useState } from 'react';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const AdminTable = ({ admins, setAdmins }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id) => {
    setOpenDeleteModal(true);
    setAdminToDelete(id);
  };

  const confirmDeleteAdmin = async () => {
    if (adminToDelete !== null) {
      try {
        const adminDocRef = doc(db, 'adminPanel', adminToDelete);
        await deleteDoc(adminDocRef);

        const newAdmins = admins.filter((admin) => admin.uid !== adminToDelete);
        setAdmins(newAdmins);
        setOpenDeleteModal(false);
      } catch (error) {
        console.error('Error deleting admin from Firestore:', error);
      }
    }
  };

  // Filter admins based on the search term
  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h3>All Admins</h3>
        <div className='search'>
          <input
            className="search-bar"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Admin Name</th>
            <th>Email</th>
            <th>Access Assigned</th>
            <th>Role</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map((admin, index) => (
            <tr key={`${admin.uid}-${index}`}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.accessRole}</td>
              <td>{admin.role}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(admin.uid)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openDeleteModal && (
        <DeleteAdminModal
          setOpenDeleteModal={setOpenDeleteModal}
          confirmDeleteAdmin={confirmDeleteAdmin}
        />
      )}
    </div>
  );
};

export default AdminTable;