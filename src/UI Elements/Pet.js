import React, { useState } from 'react';
import HeaderCard from './HeaderCard';
import PetRow from './PetRow';
import NewPet from './PetNew';

const MyPets = () => {
    const headerTextStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '24px'
    };

    const [pets, setPets] = useState([
        // Example pets
        { type: 'cat', name: 'Whiskers', temperament: ['Cuddly', 'Sleepy'], specialInstructions: 'None' },
        { type: 'dog', name: 'Rover', temperament: ['Playful', 'Energetic'], specialInstructions: 'Needs lots of exercise' },
    ]);

    const [showNewPetForm, setShowNewPetForm] = useState(false);

    return (
        <HeaderCard headerText="My Pets" headerTextStyle={headerTextStyle}>
            {pets.map((pet, index) => (
                <PetRow key={index} type={pet.type} name={pet.name} temperament={pet.temperament} specialInstructions={pet.specialInstructions} />
            ))}
            {showNewPetForm && <NewPet onSubmit={(newPet) => {
                setPets([...pets, newPet]);
                setShowNewPetForm(false);
            }} />}
            <button className="btn btn-secondary" style={{ width: '20%', margin: '15px' }} onClick={() => setShowNewPetForm(true)}>
                    Add New Pet
            </button>
        </HeaderCard>
    );
};

export default MyPets;
