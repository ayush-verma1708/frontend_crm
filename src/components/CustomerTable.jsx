import { useState, useEffect, useRef } from 'react';
import DeleteCustomerModal from '../modals/DeleteCustomerModal';
import UpdateCustomerDetailsModal from '../modals/UpdateCustomerDetailsModal';
import NotesModal from '../modals/NotesModal';
import FilterModal from '../modals/FilterModal';
import {
  fetchRecords,
  updateCustomer,
  deleteCustomer,
} from '../api/fetchapi.js';
import './customerTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import ExportModal from '../modals/ExportModal'; // Assuming you have a component for the modal

const CustomerTable = () => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [openUpdateDetailsModal, setOpenUpdateDetailsModal] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // State for sorting order
  const [fields, setFields] = useState([]); // For dynamic fields
  const [NewfilteredCustomers, setNewFilteredCustomers] = useState(customers);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedModelTypes, setSelectedModelTypes] = useState([]);
  const [filterCustomers, setFilterCustomers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Track the current page

  const magazines = JSON.parse(localStorage.getItem('magazine'));
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  const [tableFields, setTableFields] = useState({
    Name: true,
    Magazine: true,
    Amount: true,
    Country_Code: false,
    Email: true,
    // Payment_Type: true,
    Order_id: true,
    Address: false,
    Product: false,
    Model_Type: false,
    Model_Insta_Link: true,
    Note: false,
    Follow_Up_Date: false,
  });

  // Price range states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // Update the page number
    fetchCustomers(newPage, 200, search, minPrice, maxPrice);
  };

  const filteredCustomers = customers.filter((customer) => {
    const amount = parseFloat(customer.Amount);
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    const isWithinMin = isNaN(min) || amount >= min;
    const isWithinMax = isNaN(max) || amount <= max;

    const matchesModelType =
      selectedModelTypes.length === 0 ||
      selectedModelTypes.includes(customer.user_info?.Model_Type);

    return isWithinMin && isWithinMax && matchesModelType;
  });

  const handleNotesUpdated = () => {
    // loadRecords(); // Refresh records after note update
    fetchCustomers();
  };

  const handleSearch = (query) => {
    const tokens = query.toLowerCase().split(' ').filter(Boolean); // Split by space and remove empty strings
    const filtered = customers.filter((customer) =>
      tokens.every(
        (token) => customer.name.toLowerCase().includes(token) // Check if each token matches any part of the name
      )
    );
    setNewFilteredCustomers(filtered);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearch(value); // Call search on every input change
  };

  const handleFilterClick = () => {
    setShowFilterOptions((prev) => !prev);
  };

  const handleFilterChange = (e) => {
    const { id, checked } = e.target;
    setSelectedModelTypes((prev) =>
      checked ? [...prev, id] : prev.filter((type) => type !== id)
    );
  };

  const fetchCustomers = async (
    currentPage = 1,
    pageSize = 200,
    search = '',
    minPrice = 0,
    maxPrice = Number.MAX_VALUE
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching customers with:', {
        currentPage,
        pageSize,
        search,
        minPrice,
        maxPrice,
      });

      // Pass updated values
      const data = await fetchRecords(
        currentPage,
        pageSize,
        search,
        minPrice,
        maxPrice
      );

      const mergedCustomers = mergeCustomersByEmail(data.records);

      setCustomers(mergedCustomers);
      if (mergedCustomers.length > 0) {
        setFields(Object.keys(mergedCustomers[0]));
      }

      setTotalPages(data.totalPages || Math.ceil(data.totalRecords / pageSize));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const debounceTimeout = useRef(null); // Store the timeout ID

  useEffect(() => {
    // Clear previous timeout if it's still running
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout for the fetch call
    debounceTimeout.current = setTimeout(() => {
      console.log('useEffect triggered:', { search, minPrice, maxPrice });
      fetchCustomers(1, 200, search, minPrice, maxPrice);
    }, 500); // 500ms delay (you can adjust this as needed)

    // Clean up the timeout when component unmounts or values change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search, minPrice, maxPrice]); // Dependencies: search, minPrice, maxPrice

  const mergeCustomersByEmail = (data) => {
    const emailMap = {};

    data.forEach((customer) => {
      const email1 = customer.Email || '';
      const email2 = customer.Email || '';
      const emailKey = email1 === email2 ? email1 : `${email1}_${email2}`;

      if (emailMap[emailKey]) {
        const existingCustomer = emailMap[emailKey];

        existingCustomer.Product = existingCustomer.Product
          ? `${existingCustomer.Product}\n- ${customer.Product}`
          : `- ${customer.Product}`;

        existingCustomer.Magazine += `, ${customer.Magazine}`;

        // Check both existing and current customer status before adding Amount
        if (
          existingCustomer.Status == 'Declined' &&
          customer.Status !== 'Declined'
        ) {
          existingCustomer.Amount = 0;
          existingCustomer.Amount = Math.round(
            (existingCustomer.Amount || 0) + (customer.Amount || 0)
          );
        } else {
          if (customer.Status !== 'Declined') {
            existingCustomer.Amount = Math.round(
              (existingCustomer.Amount || 0) + (customer.Amount || 0)
            );
          } else {
            console.log(
              'Payment not added: Payment type is single, or one status is Declined.'
            );
          }
        }

        existingCustomer.Quantity += customer.Quantity || 0;
        existingCustomer.Notes += ', ' + (customer.Notes || '');
        existingCustomer.NoteDate = new Date(
          Math.max(
            new Date(existingCustomer.NoteDate),
            new Date(customer.NoteDate)
          )
        );
      } else {
        emailMap[emailKey] = { ...customer };
      }
    });

    // Convert the map values back to an array
    return Object.values(emailMap);
  };

  useEffect(() => {
    setFilterCustomers(
      customers.filter((customer) => {
        const amount = parseFloat(customer.Amount);
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        const isWithinMin = isNaN(min) || amount >= min;
        const isWithinMax = isNaN(max) || amount <= max;

        const matchesModelType =
          selectedModelTypes.length === 0 ||
          selectedModelTypes.includes(customer.user_info?.Model_Type);

        return isWithinMin && isWithinMax && matchesModelType;
      })
    );
  }, [customers, minPrice, maxPrice, selectedModelTypes]);

  // Function to fetch the record notes
  const loadNotes = async () => {
    try {
      console.log('note updated');
      fetchCustomers();
    } catch (error) {
      console.error('Error fetching record:', error);
    }
  };

  // Fetch notes when component mounts or when `currentCustomerId` changes
  useEffect(() => {
    if (currentCustomerId) {
      loadNotes();
    }
  }, [currentCustomerId]);

  const handleDelete = (id) => {
    setOpenDeleteModal(true);
    setCustomerToDelete(id);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete !== null) {
      try {
        await deleteCustomer(customerToDelete);
        setCustomers(
          customers.filter((customer) => customer._id !== customerToDelete)
        );
        setOpenDeleteModal(false);
      } catch (err) {
        setError('Error deleting customer');
      }
    }
  };

  const handleEdit = (id) => {
    window.localStorage.setItem('currCustId', id);
    const customer = customers.find((customer) => customer._id === id);
    setCurrentCustomerId(id);
    setSelectedNotes(customer.Notes);
    setCurrentCustomer(customer);
    setOpenUpdateDetailsModal(true);
  };

  const handleEye = (id) => {
    window.localStorage.setItem('currCustId', id);
    const customer = customers.find((customer) => customer._id === id);
    setCurrentCustomerId(id);
    setSelectedNotes(customer.Notes);
    setCurrentCustomer(customer);
    setOpenNotesModal(true);
  };

  const confirmUpdateDetails = async (updatedData) => {
    try {
      const updatedCustomer = await updateCustomer(
        currentCustomer._id,
        updatedData
      ); // Call the update API
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === updatedcustomer._id ? updatedCustomer : customer
        )
      );
      setOpenUpdateDetailsModal(false);
    } catch (err) {
      setError('Error updating customer');
    }
  };

  const sortCustomersByAmount = () => {
    const sortedCustomers = [...customers].sort((a, b) => {
      const amountA = parseFloat(a.Amount);
      const amountB = parseFloat(b.Amount);
      return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
    });
    setCustomers(sortedCustomers);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div
      className='customer-table-container'
      onClick={() => setShowFilterOptions(false)}
    >
      <div className='table-header'>
        <div className='leftHeader'>
          <h3>All Customers</h3>
        </div>

        <div className='rightHeader'>
          <div className='search-and-filter'>
            <input
              className='search-bar'
              type='text'
              placeholder='Search'
              value={search}
              onChange={handleChange}
            />
            <div>
              {filteredCustomers.map((customer) => (
                <div key={customer.id}>{customer.name}</div>
              ))}
            </div>
            <div className='filterDropdown'>
              <i
                class='fa-solid fa-sliders'
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterClick();
                }}
              ></i>
              {showFilterOptions && (
                <ul
                  className='filterOptions'
                  onClick={(e) => e.stopPropagation()}
                >
                  <li>
                    <input
                      type='checkbox'
                      name='model_type'
                      id='Model'
                      className='model_type-checkbox'
                      onChange={handleFilterChange}
                      checked={selectedModelTypes.includes('Model')}
                    />
                    <label htmlFor='Model'>Model</label>
                  </li>
                  <li>
                    <input
                      type='checkbox'
                      name='model_type'
                      id='Photographer'
                      className='model_type-checkbox'
                      onChange={handleFilterChange}
                      checked={selectedModelTypes.includes('Photographer')}
                    />
                    <label htmlFor='Photographer'>Photographer</label>
                  </li>
                  <li>
                    <input
                      type='checkbox'
                      name='model_type'
                      id='Mua'
                      className='model_type-checkbox'
                      onChange={handleFilterChange}
                      checked={selectedModelTypes.includes('Mua')}
                    />
                    <label htmlFor='Mua'>Mua</label>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        <button className='export-btn' onClick={handleExportClick}>
          <i className='fa-solid fa-download'></i> Export
        </button>
      </div>

      <div
        style={{
          gap: '12px',
          display: 'flex',
          padding: '8px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto',
        }}
        className='columnFilter'
      >
        {Object.entries(tableFields).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
              fontSize: '0.5rem',
              display: 'flex',
            }}
          >
            <input
              type='checkbox'
              checked={value}
              onChange={() =>
                setTableFields((prev) => ({
                  ...prev,
                  [key]: !value,
                }))
              }
              style={{ marginRight: '8px' }}
            />
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#333',
                cursor: 'pointer',
              }}
            >
              {key}
            </label>
          </div>
        ))}
      </div>

      {/* Price Range Inputs */}
      <div className='price-range-selector'>
        <div className='price-input-group'>
          <label htmlFor='minPrice'>Min Price</label>
          <input
            id='minPrice'
            type='number'
            placeholder='0'
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className='price-input-group'>
          <label htmlFor='maxPrice'>Max Price</label>
          <input
            id='maxPrice'
            type='number'
            placeholder='1000'
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className='pagination-controls'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'background-color 0.3s, color 0.3s',
            }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNum = index + 1;

            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)} // Set to pageNum instead of currentPage + 1
                  disabled={currentPage === pageNum}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor:
                      currentPage === pageNum ? '#2563eb' : '#ffffff',
                    color: currentPage === pageNum ? '#ffffff' : '#374151',
                    fontWeight: currentPage === pageNum ? '600' : '500',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'background-color 0.3s, color 0.3s',
                  }}
                >
                  {pageNum}
                </button>
              );
            }

            if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
              return (
                <span
                  key={pageNum}
                  style={{
                    padding: '8px',
                    color: '#9ca3af', // Light gray for ellipsis
                    fontSize: '14px',
                  }}
                >
                  ...
                </span>
              );
            }

            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor:
                currentPage === totalPages ? '#f9fafb' : '#ffffff',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'background-color 0.3s, color 0.3s',
            }}
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className='customer-table-content'>
          <table className='customer-table'>
            <thead>
              <tr>
                {tableFields.Name && <th>Name</th>}
                {tableFields.Magazine && <th>Magazine</th>}
                {/* {tableFields.Payment_Type && <th>Payment_Type</th>} */}
                {tableFields.Amount && (
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={sortCustomersByAmount}
                  >
                    Amount
                    {sortOrder === 'asc' ? (
                      <FontAwesomeIcon icon={faSortUp} className='sort-icon' />
                    ) : (
                      <FontAwesomeIcon
                        icon={faSortDown}
                        className='sort-icon'
                      />
                    )}
                  </th>
                )}
                {tableFields.Country_Code && <th>Country Code</th>}

                {tableFields.Email && <th>Email</th>}
                {tableFields.Address && <th>Address</th>}
                {tableFields.Order_id && <th>Order Id</th>}
                {tableFields.Model_Type && <th>Model Type</th>}
                {tableFields.Model_Insta_Link && (
                  <th>
                    <a
                      href={tableFields.Model_Insta_Link}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Insta Link
                    </a>
                  </th>
                )}

                {tableFields.Product && <th>Products</th>}
                {tableFields.Note && <th>Notes</th>}
                {tableFields.Follow_Up_Date && <th>Date</th>}
                <th>Edit Note</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                return (
                  <tr key={customer._id}>
                    {tableFields.Name && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Full_Name}
                        </a>
                      </td>
                    )}

                    {tableFields.Magazine && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Magazine}
                        </a>
                      </td>
                    )}

                    {/* {tableFields.Payment_Type && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Payment_Type}
                        </a>
                      </td>
                    )} */}

                    {tableFields.Amount && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          $ {customer.Amount}
                        </a>
                      </td>
                    )}

                    {tableFields.Country_Code && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Country_Code}
                        </a>
                      </td>
                    )}

                    {tableFields.Email && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Email}
                        </a>
                      </td>
                    )}

                    {tableFields.Address && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Address}
                        </a>
                      </td>
                    )}

                    {tableFields.Order_id && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {customer.Order_id}
                        </a>
                      </td>
                    )}

                    {tableFields.Model_Type && (
                      <td>
                        <a
                          href={customer.user_info?.Model_Type}
                          className='link-cell'
                        >
                          {customer.user_info?.Model_Type}
                        </a>
                      </td>
                    )}

                    {tableFields.Model_Insta_Link && (
                      <td>
                        <a
                          href={customer.user_info?.Model_Insta_Link}
                          className='link-cell'
                        >
                          {customer.user_info?.Model_Insta_Link}
                        </a>
                      </td>
                    )}

                    {tableFields.Product && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          <ul style={{ paddingLeft: '16px', margin: 0 }}>
                            {customer.Product.split(',').map(
                              (product, index) => (
                                <li
                                  key={index}
                                  style={{
                                    listStyleType: 'disc',
                                    marginBottom: '4px',
                                  }}
                                >
                                  {product.trim()}
                                </li>
                              )
                            )}
                          </ul>
                        </a>
                      </td>
                    )}

                    {tableFields.Note && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {(customer.Notes != undefined ||
                            customer.Notes != null ||
                            customer.Notes == '') && (
                            <span>{customer?.Notes}</span>
                          )}
                        </a>
                      </td>
                    )}
                    {tableFields.Follow_Up_Date && (
                      <td>
                        <a
                          href={`/records/${customer._id}`}
                          className='link-cell'
                        >
                          {(customer.NoteDate != undefined ||
                            customer.NoteDate != null ||
                            customer.NoteDate == '') && (
                            <span>
                              {new Date(customer?.NoteDate).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          )}
                        </a>
                      </td>
                    )}

                    <td>
                      <button
                        className='notes-btn'
                        onClick={() => handleEye(customer._id)}
                      >
                        <i className='fa-solid fa-eye'></i>
                      </button>
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {showExportModal && (
        <ExportModal
          open={showExportModal}
          data={customers} // Pass the filtered customer data to the modal
          closeModal={closeExportModal}
        />
      )}
      {openNotesModal && (
        <NotesModal
          setOpenNotesModal={setOpenNotesModal}
          initialNotes={selectedNotes} // Pass the initial notes to the modal
          onNotesUpdated={handleNotesUpdated}
          // onNotesUpdated={(updatedNotes) => setNotes(updatedNotes)}
          currentCustomerId={currentCustomerId}
        />
      )}

      {openFilterModal && (
        <FilterModal setOpenFilterModal={setOpenFilterModal} />
      )}

      {openDeleteModal && (
        <DeleteCustomerModal
          setOpenDeleteModal={setOpenDeleteModal}
          confirmDeleteCategory={confirmDeleteCustomer}
        />
      )}

      {openUpdateDetailsModal && (
        <UpdateCustomerDetailsModal
          CurrentCustomerId={currentCustomerId}
          setOpenUpdateDetailsModal={setOpenUpdateDetailsModal}
          confirmUpdateDetails={confirmUpdateDetails}
        />
      )}
    </div>
  );
};

export default CustomerTable;
