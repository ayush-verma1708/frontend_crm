import './deleteAdminModal.css';

const LogoutModal = ({ setOpenLogoutModal, confirmLogout }) => { 
  return (
    <div className='deleteAdminModal-bg' onClick={() => setOpenLogoutModal(false)}>
      <div className="deleteAdminModal-container" onClick={(e) => e.stopPropagation()}>
        <div className="headingDiv">
          Alert
        </div>

        <p className='modalBody'>Are you sure you want to logout?</p>
        <div className="deleteAdminModal-Btns">
          <button onClick={() => setOpenLogoutModal(false)}>Cancel</button>
          <button onClick={confirmLogout} style={{ backgroundColor: "#5932EA" }}>Logout</button> 
        </div>
      </div>
    </div>
  )
}

export default LogoutModal;