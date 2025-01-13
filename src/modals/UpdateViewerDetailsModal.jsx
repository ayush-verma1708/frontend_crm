import React, { useState, useEffect } from 'react';
import './UpdateViewerDetailsModal.css';
import InputField from '../components/InputField';

const UpdateViewerDetailsModal = ({
  currentCustomer,
  setOpenUpdateDetailsModal,
  handleUpdateDetails,
}) => {
  const [formData, setFormData] = useState({
    Email_Address: currentCustomer?.Email_Address || '',
    Model_Type: currentCustomer?.Model_Type || '',
    Stage_Name: currentCustomer?.Stage_Name || '',
    Model_Insta_Link: currentCustomer?.Model_Insta_Link || '',
  });

  // Update state when the currentCustomer changes
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        Email_Address: currentCustomer.Email_Address || '',
        Model_Type: currentCustomer.Model_Type || '',
        Stage_Name: currentCustomer.Stage_Name || '',
        Model_Insta_Link: currentCustomer.Model_Insta_Link || '',
      });
    }
  }, [currentCustomer]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    await handleUpdateDetails(formData);
  };

  return (
    <div
      className='updateViewerDetailsModal-bg'
      onClick={() => setOpenUpdateDetailsModal(false)}
    >
      <div
        className='updateViewerDetailsModal-container'
        onClick={(e) => e.stopPropagation()}
      >
        <i
          onClick={() => setOpenUpdateDetailsModal(false)}
          className='fa-regular fa-circle-xmark cross'
        ></i>
        <form className='updateForm' onSubmit={handleSubmit}>
          <div className='input-labels'>
            <InputField
              label='Model Type'
              type='text'
              name='Model_Type'
              value={formData.Model_Type}
              onChange={handleChange}
            />
            <InputField
              label='Stage Name'
              type='text'
              name='Stage_Name'
              value={formData.Stage_Name}
              onChange={handleChange}
            />
            <InputField
              label='Model Insta Link'
              type='text'
              name='Model_Insta_Link'
              value={formData.Model_Insta_Link}
              onChange={handleChange}
            />
            <InputField
              label='Email Address'
              type='email'
              name='Email_Address'
              value={formData.Email_Address}
              onChange={handleChange}
            />
          </div>
          <button type='submit' className='updateBtn'>
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateViewerDetailsModal;