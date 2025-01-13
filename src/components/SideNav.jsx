import NavItem from './NavItem';
import { NavLink } from 'react-router-dom';
import './sideNav.css';
import logo from '../assets/logo.jpg';
import Logout from '../components/NavLogout';

const SideNav = () => {
  const role = localStorage.getItem('role');

  return (
    <div className='side-nav'>
      <div className='logo-img'>
        <img src={logo} alt='Logo' />
      </div>

      <div className='nav-items'>
        <NavLink to='/Dashboard'>
          <NavItem navIcon={'fa-solid fa-table-cells-large'} iconName={"Dashboard"}/>
        </NavLink>

        <NavLink to='/Customer'>
          <NavItem navIcon={'fa-solid fa-user-group'} iconName={"Customer"}/>
        </NavLink>

        <NavLink to='/Viewer'>
          <NavItem navIcon={'fa-solid fa-users-viewfinder'} iconName={"Viewer"}/>
        </NavLink>

        {role=="Owner" && (
          <>
            <NavLink to='/Add-Data'>
              <NavItem navIcon={'fa-solid fa-plus'} iconName={"Add Data"}/>
            </NavLink>

            <NavLink to='/AccessRole'>
              <NavItem navIcon={'fa-solid fa-gear'} iconName={"Access Role"}/>
            </NavLink>
          </>
        )}
      </div>

      <Logout iconName={"Logout"}/>
    </div>
  );
};

export default SideNav;
