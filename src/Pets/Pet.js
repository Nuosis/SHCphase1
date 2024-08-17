import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
// import ButtonContainer from '../UI Elements/ButtonContainer';
import {IconButton} from '../UI Elements/Button';
import PetRow from './PetRow';
import NewPet from './PetNew';

//TODO: Clicking on Sunny Loads Madi

const MyPets = ({json, onSubmit}) => {
    console.log('MyPets Called: ',{json})
    // Convert the initial JSON data to a usable state format
    const parsedPets = json.map((entry) => ({
        ...JSON.parse(entry.data),
        id: entry.ID,
        dapiRecordID: entry.dapiRecordID
    }));
    console.log({parsedPets})
    //STATE
    const [pets, setPets] = useState(parsedPets);
    const [showNewPetForm, setShowNewPetForm] = useState(false); // show form if pets array is empty
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
    
    return (
        <div className="flex flex-col items-center justify-between">
            <HeaderCard headerText="My Pets">
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
                {!showNewPetForm && (
                    <div className="flex">
                        <div className="grow"></div>
                        <IconButton
                            icon="AddCircle"
                            className="btn btn-primary self-end"
                            type="button"
                            text="New Pet"
                            onClick={(handleAddPet)}
                        />
                    </div>
                )}
            </HeaderCard>
        </div>
    );
};

export default MyPets;
