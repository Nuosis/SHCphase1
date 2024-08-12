import React, { useState } from 'react';
import Card from './Card';

const CardContainer = ({ cardsData }) => {
    // Initialize openCardId based on defaultOpen
    const initialOpenCardId = cardsData.find(card => card.defaultOpen)?.id || null;
    const [openCardId, setOpenCardId] = useState(initialOpenCardId);
  
    const handleCardToggle = (id) => {
      setOpenCardId(prevId => (prevId === id ? null : id));
    };
  
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        {cardsData.map((cardData) => (
          <Card
            key={cardData.id}
            id={cardData.id}
            headerText={cardData.headerText}
            headerHiddenText={cardData.headerHiddenText}
            onNew={cardData.onNew}
            defaultOpen={cardData.isOpen}
            flex={cardData.flex}
            isOpen={openCardId === cardData.id}
            onToggle={() => handleCardToggle(cardData.id)}
          >
            {cardData.children}
          </Card>
        ))}
      </div>
    );
  };

export default CardContainer;