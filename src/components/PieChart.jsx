import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { fetchRecords } from '../api/fetchapi';
import './pieChart.css';

const PieChart = () => {
  const [magazineData, setMagazineData] = useState({});
  const magazines = JSON.parse(localStorage.getItem('magazine'));

  useEffect(() => {
    const fetchMagazineData = async () => {
      try {
        // Fetch data using fetchRecords
        const response = await fetchRecords(1, 100);
        const magazineCounts = response.magazineCounts;

        // Filter the magazineCounts to include only those matching the names in 'magazines' (case insensitive)
        const filteredMagazineCounts = magazineCounts.filter(({ _id }) => {
          // Check if _id is a valid string before using toLowerCase
          return _id && typeof _id === 'string' && magazines.some((magazine) => 
            _id.trim().toLowerCase() === magazine.trim().toLowerCase());
        });

        // Transform the filtered magazineCounts array into a usable object
        const magazineData = {};
        filteredMagazineCounts.forEach(({ _id, count }) => {
          magazineData[_id] = count; // _id is the magazine name
        });

        setMagazineData(magazineData);
      } catch (error) {
        console.error('Error fetching magazine data:', error);
      }
    };

    fetchMagazineData();
  }, []);

  // Show loading state if no data
  if (Object.keys(magazineData).length === 0) {
    return <p>Loading...</p>;
  }

  const options = {
    labels: Object.keys(magazineData),
    colors: [
      '#ff595e', '#ff924c', '#ffca3a', '#c5ca30', '#8ac926',
      '#52a675', '#1982c4', '#4267ac', '#6a4c93', '#d677b8'
    ],
    legend: { position: 'bottom' },
  };

  const series = Object.values(magazineData);

  return (
    <div className="pieChart-container">
      <h3>Customers Chart</h3>
      <Chart options={options} series={series} type="pie" width={380} />
    </div>
  );
};

export default PieChart;