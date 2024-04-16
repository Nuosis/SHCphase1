import React from 'react';
import '../index.css';

const Portrait = ({ imageUrl }) => {
  return (
    <div className="portraitContainer">
      <img src={imageUrl} alt="Portrait" className="circularPortraitFrame" />
    </div>
  );
}

export default Portrait;
