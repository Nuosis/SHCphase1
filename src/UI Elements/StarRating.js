import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((star, index) => {
        const returnValue = index + 1;

        return (
          <IconButton
            key={index}
            onClick={() => setRating(returnValue)}
            onMouseEnter={() => setHover(returnValue)}
            onMouseLeave={() => setHover(null)}
          >
            {returnValue <= (hover || rating) ? (
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
