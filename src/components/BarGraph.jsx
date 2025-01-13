import React, { useEffect, useState, useMemo } from 'react';
import Chart from "react-apexcharts";
import { fetchRecords } from '../api/fetchapi.js';
import './barGraph.css';

const Bargraph = () => {
  // Use useMemo to load magazines from localStorage only once
  const magazines = useMemo(() => JSON.parse(localStorage.getItem('magazine')) || [], []);

  const [chartData, setChartData] = useState({
    categories: [],
    series: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesData = await fetchRecords(1, 100);
        const magazineSales = salesData.magazineSales || [];
    
        // Filter the magazine sales data based on the magazine names in the localStorage
        const filteredSales = magazineSales.filter((item) =>
          magazines.some((magazine) => magazine.toLowerCase() === (item._id || '').toLowerCase().trim())
        );
    
        // If no data matches the filter, set default "No Data"
        if (filteredSales.length === 0) {
          setChartData({ categories: ["No Data"], series: [0] });
        } else {
          // Extract the categories and series
          const categories = filteredSales.map((item) => item._id || "Unknown");
          const series = filteredSales.map((item) => Math.round(item.totalSales) || 0);
    
          setChartData({ categories, series });
        }
      } catch (error) {
        console.error("Error fetching bargraph data:", error);
        setChartData({ categories: ["No Data"], series: [0] });
      }
    };    

    fetchData();
  }, [magazines]); // No need to depend on localStorage anymore

  const options = {
    chart: {
      height: 350,
      type: 'line',
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      categories: chartData.categories.length ? chartData.categories : ["No Data"],
    },
    yaxis: {
      title: {
        text: 'Sales',
      },
    },
  };

  const series = [
    {
      name: 'Sales',
      data: chartData.series.length ? chartData.series : [0],
    },
  ];

  return (
    <div className='barGraph-container'>
      <h3>Sales Graph</h3>
      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
};

export default Bargraph;