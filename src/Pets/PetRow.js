import React, { /*useState*/ } from 'react';
import Portrait from '../UI Elements/Portrait';
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
                    <span className="font-bold text-lg">{name}</span>
                    <div className="flex flex-col">
                        <div>temperament: {temperament.join(', ')}</div>
                        <div>Special Instructions: {specialInstructions}</div>
                        <button className="w-12 bg-slate-300 rounded-md" onClick={() => onEdit(id)}>edit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetRow;
