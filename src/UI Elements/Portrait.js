import React from 'react';
import '../index.css';

const Portrait = ({ imageUrl }) => {
  return (
    <div className="portraitContainer">
      <img src={imageUrl} alt="Portrait" className="circularPortraitFrame mr-8" />
    </div>
  );
}

export default Portrait;
