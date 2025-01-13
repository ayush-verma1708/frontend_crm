import React from 'react';
import './dataBoxes.css';
import CountUp from 'react-countup'

const DataBoxes = ({ data }) => {
  const { title, amount, backgroundColor, icon } = data;

  return (
    <div
      className="dataBoxes-container"
      style={{ backgroundColor }}
    >
      <div className="icon" style={{color: backgroundColor}}>
        {icon}
      </div>
      <div className="details">
        <p>{title}</p>
        <h2><CountUp start={0} end={amount} duration={2} separator=',' prefix={title=="Total Sales" ? '$' : ""}/></h2>
      </div>
    </div>
  );
};

export default DataBoxes;