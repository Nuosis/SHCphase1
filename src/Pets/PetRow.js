import React, { /*useState*/ } from 'react';
import Portrait from '../UI Elements/Portrait';
import { IconButton } from '../UI Elements/Button';
import defaultCat from '../images/7ed19a9d-ae10-44c1-b39b-ae745d8ddde2.webp'
import defaultDog from '../images/bd51675e-d16b-4c1d-b684-938aa8e40942.webp'

const PetRow = ({ id, type, name, temperament, specialInstructions, onEdit }) => {
    const imageUrl = type === 'cat' ?
        defaultCat :
        defaultDog ;

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center">
                <Portrait imageUrl={imageUrl} />
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg text-primary dark:text-secondary mb-4">{name}</h2>
                    <div className="">
                        <div>Temperament: {temperament.join(', ')}</div>
                        <div>Special Instructions: {specialInstructions}</div>
                        <IconButton
                            icon="Edit"
                            className="btn btn-outline btn-sm dark:btn-outline dark:text-gray-500 mt-4"
                            text="Edit"
                            onClick={() => onEdit(id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetRow;
