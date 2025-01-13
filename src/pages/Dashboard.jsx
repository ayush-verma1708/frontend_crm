import { useEffect, useState } from 'react';
import './dashboard.css';
import Menubar from '../components/Menubar';
import { fetchRecords, fetchUsers } from '../api/fetchapi.js';
import { fetchAdmins } from '../services/FirestoreManager';
import DataBoxes from '../components/DataBoxes';
import BarGraph from '../components/BarGraph';
import PieChart from '../components/PieChart';
import PriortyCustomers from '../components/TopCustomerTable.jsx';
import '../components/stats.css';

const Dashboard = () => {
  const magazines = JSON.parse(localStorage.getItem('magazine')) || [];

  const [data, setData] = useState({
    sales: {
      title: "Total Sales",
      amount: 0,
      backgroundColor: "#ffe7e7",
      icon: <i className="fa-solid fa-money-bill-trend-up"></i>
    },
    customers: {
      title: "Total Customers",
      amount: 0,
      backgroundColor: "#caa6a6",
      icon: <i className="fa-solid fa-user"></i>
    },
    viewers: {
      title: "Total Viewers",
      amount: 0,
      backgroundColor: "#b47b84",
      icon: <i className="fa-solid fa-users-viewfinder"></i>
    },
    admins: {
      title: "Total Admins",
      amount: 0,
      backgroundColor: "#944e63",
      icon: <i className="fa-solid fa-laptop-code"></i>
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, userData, adminData] = await Promise.all([
          fetchRecords(1, 1000),
          fetchUsers(1, 1000),
          fetchAdmins(),
        ]);
        
        // Filter sales data based on magazines stored in localStorage
        const magazineSales = salesData.magazineSales || [];
        const filteredSales = magazineSales.filter((item) =>
          magazines.some((magazine) => magazine.toLowerCase() === (item._id || '').toLowerCase().trim())
        );

        // Calculate the total sales based on the filtered magazines
        const totalSales = filteredSales.reduce((sum, item) => sum + (item.totalSales || 0), 0);

        // Filter count data based on magazines stored in salesData
        const magazineCount = salesData.magazineCounts || [];
        const filteredCount = magazineCount.filter((item) =>
          magazines.some((magazine) => magazine.toLowerCase() === (item._id || '').toLowerCase().trim())
        );

        const totalRecords =filteredCount.reduce((sum, item) => sum + (item.count|| 0), 0);

        // Filter count data based on magazines stored in userData
        const magazineViewer = userData.magazineCounts || [];
        const filteredViewer = magazineViewer.filter((item) =>
          magazines.some((magazine) => magazine.toLowerCase() === (item._id || '').toLowerCase().trim())
        );

        const totalViewers = filteredViewer.reduce((sum, item) => sum + (item.emailCounts.length|| 0), 0);

        setData((prevState) => ({
          ...prevState,
          sales: {
            ...prevState.sales,
            amount: totalSales || 0,
          },
          customers: {
            ...prevState.customers,
            // amount: salesData.totalRecords || 0,
            amount: totalRecords || 0,
          },
          admins: {
            ...prevState.admins,
            amount: adminData.length || 0,
          },
          viewers: {
            ...prevState.viewers,
            // amount: userData.totalRecords,
            amount: totalViewers,
          }
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when component mounts (i.e., don't depend on `magazines`)
    if (magazines.length > 0) {
      fetchData();
    }
  }, []); // Empty dependency array to run only once on mount

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className='dashboard-body'>
      <Menubar heading='Dashboard' />
      <div className='dashboard-content'>
        <div className="data-boxes">
          {Object.keys(data).map((category, index) => (
            <DataBoxes key={index} data={data[category]} />
          ))}
        </div>
        <div className="charts">
          <BarGraph />
          <PieChart />
        </div>
        <div className="priortyCustomers">
          <PriortyCustomers/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;