import { useState } from 'react';
import './addAdminModal.css';
import InputField from '../components/InputField';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AddAdminModal = ({ setOpenAddAdminModal, addAdmin }) => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    password: '',
    accessAssigned: '',
    role: ''
  });
  
  const accessAssignedOptions = ['ALPHERO', 'BLACKCRUZE', 'BLAZE', 'CON', 'ENVY',
    'MAC', 'MAGBLACK', 'MIRROR', 'UNCOVER', 'WILL'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (option) => {
    setFormData((prevFormData) => {
      const newAccessAssigned = prevFormData.accessAssigned.includes(option)
        ? prevFormData.accessAssigned.filter((item) => item !== option) // Remove if already selected
        : [...prevFormData.accessAssigned, option]; // Add if not selected

      return { ...prevFormData, accessAssigned: newAccessAssigned };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const adminData = {
        name: formData.name,
        email: formData.email,
        accessAssigned: formData.accessAssigned,
        uid: user.uid, 
      };

      await setDoc(doc(db, "adminPanel", user.uid), {
        magazine: formData.accessAssigned,
        email: formData.email,
        name: formData.name,
        uid: user.uid,
        role: 'Admin'
      });

      addAdmin(adminData);

      setOpenAddAdminModal(false);

      alert("Admin created successfully!");
    } catch (error) {
      console.error("Error creating admin: ", error);
      alert("Error creating admin: " + error.message);
    }
  };

  return (
    <div className='addAdminModal-bg' onClick={() => setOpenAddAdminModal(false)}>
      <div className="addAdminModal-container" onClick={(e) => e.stopPropagation()}>
        <div className='modalTopLine'>
          <h2 className='AdminName'>Add Admin</h2>
          <span onClick={() => setOpenAddAdminModal(false)}>
            <i style={{ backgroundColor: 'white', color: '#5932EA', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem' }} className="fa-regular fa-circle-xmark"></i>
          </span>
        </div>
        <form className='addAdminForm' onSubmit={handleSubmit}>
          <div className='input-labels'>
            <InputField label="Admin Name" type="text" name="name" value={formData.name} onChange={handleChange} /> 
            <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />

            {/* Dropdown for Access Assigned */}
            <label className='dropdown-label'>
              Access Assigned
              <div className='magazineOptions'>
                {accessAssignedOptions.map((option, index) => (
                  <label  key={index} style={{ display: 'block', marginTop: '0.35rem', textAlign:'left', marginLeft:'1rem' }}>
                    <input
                      type="checkbox"
                      name="accessAssigned"
                      value={option}
                      checked={formData.accessAssigned.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                      className='checkbox'
                    />
                    {option}
                  </label>
                ))}
              </div>
            </label>
          </div>
          <button className='add-btn' type="submit">Add</button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;