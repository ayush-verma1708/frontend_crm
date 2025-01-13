import './navItem.css'; 

const NavItem = ({navIcon, iconName}) => {
  return (
    <div className='round'>    
      <div className="nav-item">
        <i className={navIcon}></i>
        <span className="icon-name">{iconName}</span>
      </div>
    </div>
  );
};

export default NavItem;