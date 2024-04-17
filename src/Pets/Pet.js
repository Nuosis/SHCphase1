import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import ButtonContainer from '../UI Elements/ButtonContainer';
import {IconButton} from '../UI Elements/Button';
import PetRow from './PetRow';
import NewPet from './PetNew';

const MyPets = () => {
    //STATE
    const [pets, setPets] = useState([
        { id: 1, type: 'cat', name: 'Whiskers', temperament: ['Cuddly', 'Sleepy'], specialInstructions: 'None' },
        { id: 2, type: 'dog', name: 'Rover', temperament: ['Playful', 'Energetic'], specialInstructions: 'Needs lots of exercise' },
    ]);
    const [showNewPetForm, setShowNewPetForm] = useState(false);
    const [editablePet, setEditablePet] = useState({});

    //FUNCTIONS
    //HANDLERS
    const handleAddPet = () => {
        const newId = pets.length + 1; 
        const newPet = { id: newId, type: 'dog', name: '', temperament: [], specialInstructions: '' };
        setPets([...pets, newPet]);
        setShowNewPetForm(true);
        setEditablePet(newPet);
    };

    const handleEditPet = (petId) => {
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            setEditablePet(pet);
            setShowNewPetForm(true);
        }
    };

    const handleUpdatePet = (updatedPet) => {
        const updatedPets = pets.map(pet => pet.id === updatedPet.id ? updatedPet : pet);
        setPets(updatedPets);
        setShowNewPetForm(false);
        setEditablePet({});
    };

    const handleDeletePet = (petId) => {
        const updatedPets = pets.filter(pet => pet.id !== petId);
        setPets(updatedPets);
        setShowNewPetForm(false);
    };

    const handleCancel = () => {
        if (editablePet.name.trim() === '') {
            // If the name is empty, delete the pet
            handleDeletePet(editablePet.id);
        } else {
            // Otherwise, reset form state
            setShowNewPetForm(false);
            setEditablePet({});
        }
    };

    

    //VARIABLES
    const headerTextStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '24px'
    };

    return (
        <>
            <HeaderCard headerText="My Pets" headerTextStyle={headerTextStyle}>
                {showNewPetForm ? (
                    <NewPet
                        pet={editablePet}
                        pets={pets}
                        setPets={setPets}
                        onSubmit={editablePet ? handleUpdatePet : handleAddPet}
                        onCancel={handleCancel}
                        onDelete={handleDeletePet}
                    />
                ) : (
                    <>
                        {pets.map(pet => (
                            <PetRow key={pet.id} {...pet} onEdit={() => handleEditPet(pet.id)} />
                        ))}
                    </>
                )}
            </HeaderCard>
            {!showNewPetForm && ( 
                <ButtonContainer>
                    <IconButton
                        className="btn btn-primary"
                        type="button"
                        text="New Pet"
                        onClick={(handleAddPet)}
                    />
                </ButtonContainer>
            )}
        </>
    );
};

export default MyPets;
