import React, { useState, useEffect } from 'react';
import DeleteCustomerModal from '../modals/DeleteCustomerModal';
import UpdateViewerDetailsModal from '../modals/UpdateViewerDetailsModal';
import { fetchUsers, deleteUser, updateUser, fetchRecords } from '../api/fetchapi.js';
import './viewerTable.css';

// Pagination Component
const Pagination = ({ page, totalPages, onPageChange }) => (
  <div className='pagination-controls'>
    <button
      onClick={() => onPageChange(page - 1)}
      disabled={page === 1}
      className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, index) => {
      const pageNum = index + 1;
      if (
        pageNum === 1 ||
        pageNum === totalPages ||
        (pageNum >= page - 2 && pageNum <= page + 2)
      ) {
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        );
      }
      if (pageNum === page - 3 || pageNum === page + 3) {
        return (
          <span key={pageNum} className='ellipsis'>
            ...
          </span>
        );
      }
      return null;
    })}
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={page === totalPages}
      className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
    >
      Next
    </button>
  </div>
);

// ViewerTable Component
const ViewerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openUpdateDetailsModal, setOpenUpdateDetailsModal] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedModelTypes, setSelectedModelTypes] = useState([]);

  const magazines = JSON.parse(localStorage.getItem('magazine'));

  // const fetchCustomers = async () => {
  //   setLoading(true);
  //   try {
  //     const usersData = await fetchUsers(page, 200, search);
  //     const recordsData = await fetchRecords(page, 200, search);
  
  //     const users = Array.isArray(usersData.users) ? usersData.users : [];
  //     const records = Array.isArray(recordsData.records) ? recordsData.records : [];
  
  //     const recordEmails = new Set(records.map((record) => record.Email));
  
  //     const filteredUsers = users.filter((user) => {
  //       const searchLower = search.toLowerCase();
  //       const matchesSearch =
  //         (user.Email_Address && user.Email_Address.toLowerCase().includes(searchLower)) ||
  //         (user.Stage_Name && user.Stage_Name.toLowerCase().includes(searchLower)) ||
  //         (user.Model_Type && user.Model_Type.toLowerCase().includes(searchLower)) ||
  //         (user.Magazine_Viewer && user.Magazine_Viewer.toLowerCase().includes(searchLower)) ||
  //         (user.Model_Insta_Link && user.Model_Insta_Link.toLowerCase().includes(searchLower));
        
  //       const matchesFilter =
  //         selectedModelTypes.length === 0 || selectedModelTypes.includes(user.Model_Type);

  //       const matchesMagazine =
  //         magazines.length === 0 ||
  //         magazines.some((magazine) =>
  //           user.Magazine_Viewer && user.Magazine_Viewer.toLowerCase().includes(magazine.toLowerCase())
  //         );
  
  //       return matchesMagazine && !recordEmails.has(user.Email_Address) && matchesSearch && matchesFilter;
  //     });
  
  //     setCustomers(filteredUsers);
      
  //     setTotalPages(usersData.totalPages || Math.ceil(usersData.total / 200));
      
  //   } catch (err) {
  //     console.error('Error fetching customers:', err);
  //     setError('Error fetching customers');
  //     setCustomers([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const magazineFilter = magazines.join(','); // Convert array to comma-separated string
      const usersData = await fetchUsers(page, 200, search, magazineFilter); // Pass magazine filter
      const recordsData = await fetchRecords(page, 200, search);
  
      const users = Array.isArray(usersData.users) ? usersData.users : [];
      const records = Array.isArray(recordsData.records) ? recordsData.records : [];
  
      const recordEmails = new Set(records.map((record) => record.Email));
  
      const filteredUsers = users.filter((user) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          (user.Email_Address && user.Email_Address.toLowerCase().includes(searchLower)) ||
          (user.Stage_Name && user.Stage_Name.toLowerCase().includes(searchLower)) ||
          (user.Model_Type && user.Model_Type.toLowerCase().includes(searchLower)) ||
          (user.Magazine_Viewer && user.Magazine_Viewer.toLowerCase().includes(searchLower)) ||
          (user.Model_Insta_Link && user.Model_Insta_Link.toLowerCase().includes(searchLower));
        
        const matchesFilter =
          selectedModelTypes.length === 0 || selectedModelTypes.includes(user.Model_Type);
  
        return matchesFilter && !recordEmails.has(user.Email_Address) && matchesSearch;
      });
  
      setCustomers(filteredUsers);
      setTotalPages(usersData.totalPages || Math.ceil(usersData.total / 200));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Error fetching customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDelete = (id) => {
    setCurrentCustomer(
      customers.find((customer) => customer && customer._id === id)
    );
    setOpenDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (currentCustomer) {
      try {
        // Call the deleteUser API to delete the entry from the users database
        await deleteUser(currentCustomer._id);
  
        // Update the customers state to remove the deleted user
        setCustomers((prev) =>
          prev.filter(
            (customer) => customer && customer._id !== currentCustomer._id
          )
        );
  
        // Close the delete modal and reset error state
        setOpenDeleteModal(false);
        setError(null);
  
        console.log('Customer deleted successfully');
      } catch (err) {
        console.error(err);
        setError('Error deleting customer. Please try again.');
      }
    }
  };  

  const handleEdit = (id) => {
    const customer = customers.find((customer) => customer && customer._id === id);
    setCurrentCustomer(customer); // Set the current customer to be edited
    setOpenUpdateDetailsModal(true); // Open the modal for editing
  };  

  const handleUpdateDetails = async (updatedData) => {
    try {
      const updatedCustomer = await updateUser(currentCustomer._id, updatedData);
      setCustomers((prev) =>
        prev.map((customer) =>
          customer && customer._id === updatedCustomer._id
            ? updatedCustomer
            : customer
        )
      );
  
      setOpenUpdateDetailsModal(false);
      setError(null);
    } catch (err) {
      console.error('Error updating user details:', err);
      setError('Error updating user details. Please try again.');
    }
  };    

  useEffect(() => {
    fetchCustomers();
  }, [page, search, selectedModelTypes]);
  

  const handleFilterClick = ()=>{
    setShowFilterOptions((prev) => !prev);
  }

  const handleFilterChange = (e) => {
    const { id, checked } = e.target;
    setSelectedModelTypes((prev) =>
      checked ? [...prev, id] : prev.filter((type) => type !== id)
    );
  };

  return (
    <div className='customer-table-container' onClick={()=>setShowFilterOptions(false)}>
      <div className='table-header'>
        <h3>All Viewers</h3>
        <div className='search-and-filter'>
          <input
            type='text'
            placeholder='Search by name or email'
            value={search}
            onChange={handleSearch}
            className='search-bar'
          />
          <div className="filterDropdown">
            <i class="fa-solid fa-sliders" onClick={(e) => {
              e.stopPropagation();
              handleFilterClick();
            }}></i>
            {showFilterOptions && (
              <ul className='filterOptions' onClick={(e) => e.stopPropagation()}>
                <li>
                  <input
                    type="checkbox"
                    name="model_type"
                    id="Model"
                    className='model_type-checkbox'
                    onChange={handleFilterChange}
                    checked={selectedModelTypes.includes('Model')}
                  />
                  <label htmlFor="Model">Model</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    name="model_type"
                    id="Photographer"
                    className='model_type-checkbox'
                    onChange={handleFilterChange}
                    checked={selectedModelTypes.includes('Photographer')}
                  />
                  <label htmlFor="Photographer">Photographer</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    name="model_type"
                    id="Mua"
                    className='model_type-checkbox'
                    onChange={handleFilterChange}
                    checked={selectedModelTypes.includes('Mua')}
                  />
                  <label htmlFor="Mua">Mua</label>
                </li>
              </ul>
            )}
          </div>
        </div>
        <button className='export-btn'><i class="fa-solid fa-download"></i> Export</button>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className='error-message'>{error}</p>
      ) : (
        <>
          <div className='view-table-content' >
            <table className='view-table'>
              <thead>
                <tr>
                  <th>Model Type</th>
                  <th>Stage Name</th>
                  <th>Instagram Link</th>
                  <th>Email Address</th>
                  <th>Magazine</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(
                  (customer) =>
                    customer && (
                      <tr key={customer._id}>
                        <td>{customer.Model_Type}</td>
                        <td>{customer.Stage_Name}</td>
                        <td>
                          <a
                            href={customer.Model_Insta_Link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {customer.Model_Insta_Link}
                          </a>
                        </td>
                        <td>{customer.Email_Address}</td>
                        <td>{customer.Magazine_Viewer}</td>
                        <td>
                          <button
                            className='edit-btn'
                            onClick={() => handleEdit(customer._id)}
                          >
                            <i className='fa-solid fa-pencil'></i>
                          </button>
                        </td>
                        <td>
                          <button
                            className='delete-btn'
                            onClick={() => handleDelete(customer._id)}
                          >
                            <i className='fa-solid fa-trash'></i>
                          </button>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {openDeleteModal && (
        <DeleteCustomerModal
          setOpenDeleteModal={setOpenDeleteModal}
          confirmDeleteCategory={confirmDeleteCustomer}
        />
      )}
      {openUpdateDetailsModal && (
        <UpdateViewerDetailsModal
          currentCustomer={currentCustomer}
          setOpenUpdateDetailsModal={setOpenUpdateDetailsModal}
          handleUpdateDetails={handleUpdateDetails}
        />      
      )}
    </div>
  );
};

export default ViewerTable;