import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

const StarRating = ({ rating, setRating, submitRating }) => {
  const [hover, setHover] = useState(rating);

  const handleRating = (value) => {
    setRating(value);
    submitRating(value);
  };

  return (
    <div className="flex items-center">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;

        return (
          <IconButton
            key={index}
            onClick={() => handleRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
          >
            {ratingValue <= (hover || rating) ? (
              <Star style={{ color: "#ffc107" }} />
            ) : (
              <StarBorder style={{ color: "#e4e5e9" }} />
            )}
          </IconButton>
        );
      })}
    </div>
  );
};

export default StarRating;
