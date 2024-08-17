import React, { useState, useEffect } from 'react';
import Portrait from '../UI Elements/Portrait';
import {IconButton, TextButton} from '../UI Elements/Button';
import ButtonContainer from '../UI Elements/ButtonContainer';
import defaultCat from '../images/7ed19a9d-ae10-44c1-b39b-ae745d8ddde2.webp'
import defaultDog from '../images/bd51675e-d16b-4c1d-b684-938aa8e40942.webp' 
import '../index.css';

const NewPet = ({ pet, pets, setPets, onSubmit, onCancel, onDelete }) => {
    
    const [petType, setPetType] = useState(pet.type || 'dog');
    const [name, setName] = useState(pet.name || '');
    const [temperament, setTemperament] = useState(pet.temperament ? pet.temperament.join(', ') : '');
    const [specialInstructions, setSpecialInstructions] = useState(pet.specialInstructions || '');
    const [imageUrl, setImageUrl] = useState(pet.type === 'dog' ? defaultDog : defaultCat);


    useEffect(() => {
        // Update the image when the pet type changes
        setImageUrl(petType === 'dog' ? defaultDog : defaultCat);
    }, [petType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() === '') {
            // If the name is empty, delete the pet
            onDelete(pet.id);
        } else {
            // Otherwise, submit the pet data
            onSubmit({ id: pet.id, type: petType, name, temperament: temperament.split(',').map(t => t.trim()), specialInstructions });
        }
    };

    const handleChange = (field, value) => {
        const updatedPet = { ...pet, [field]: value };
        setPets(pets.map(p => (p.id === updatedPet.id ? updatedPet : p)));
    };

    const handleDelete = () => {
        onDelete(pet.id);
    };

    return (
      <div className="">
        <form onSubmit={handleSubmit} className="pb-4">
            <Portrait imageUrl={imageUrl} />
            <div className="mb-4">
                <label className="block text-sm font-bold text-primary dark:text-gray-400">Pet Type</label>
                <select
                    className="mt-2 px-3 py-2 text-black border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                >
                    <option value="">Select a type...</option>
                    <option value="cat">Cat</option>
                    <option value="dog">Dog</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-primary dark:text-gray-400">Pet's Name</label>
                <input
                    type="text"
                    placeholder="Pet's Name..."
                    className="mt-2 max-w-96 px-3 py-2 text-black border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        handleChange('name', e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-primary dark:text-gray-400">Temperment</label>
                <textarea
                    className="mt-2 block w-full px-3 py-2 text-black border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                    placeholder="Personality"
                    value={temperament}
                    onChange={(e) => {
                        setTemperament(e.target.value);
                        handleChange('temperament', e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                />
            </div>
            <div className="mb-8">
                <label className="block text-sm font-bold text-primary dark:text-gray-400">Special Instructions</label>
                <textarea
                    className="mt-2 block w-full px-3 py-2 text-black border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                    placeholder="Special Instructions..."
                    value={specialInstructions}
                    onChange={(e) => {
                        setSpecialInstructions(e.target.value);
                        handleChange('specialInstructions', e.target.value);
                    }}
                />
            </div>
            <ButtonContainer>
                <IconButton 
                    icon="DeleteForever"
                    className="btn btn-error text-white"
                    onClick={handleDelete}
                    type="button"
                    text="Delete"
                />
                <IconButton 
                    icon="HighlightOff"
                    className="btn btn-outline"
                    onClick={onCancel}
                    type="button"
                    text="Cancel"
                />
                <div className="grow"></div>
                <IconButton 
                    icon="CheckCircle"
                    className="btn btn-primary"
                    type="submit"
                    text="Submit"
                />
            </ButtonContainer>
        </form>
      </div>
    );
};

export default NewPet;
