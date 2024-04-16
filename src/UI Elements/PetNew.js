import React, { useState, useEffect } from 'react';
import Portrait from './Portrait';
import defaultCat from '../images/7ed19a9d-ae10-44c1-b39b-ae745d8ddde2.webp'
import defaultDog from '../images/bd51675e-d16b-4c1d-b684-938aa8e40942.webp' 
import '../index.css';

let imageUrl = ""

const NewPet = ({ onSubmit }) => {
    const [petType, setPetType] = useState('');
    const [name, setName] = useState('');
    const [temperament, setTemperament] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');

    useEffect((petType, imageUrl) => {
        if(petType === 'dog'){
            imageUrl = defaultDog
        } else {
            imageUrl = defaultCat
        }
    }, [petType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ type: petType, name, temperament, specialInstructions });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <Portrait imageUrl={imageUrl} />
            <div>
                <label className="block text-sm font-medium text-gray-700">Pet Type</label>
                <select
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                >
                    <option value="">Select a type</option>
                    <option value="cat">Cat</option>
                    <option value="dog">Dog</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Pet's Name</label>
                <input
                    type="text"
                    placeholder="Pet's Name"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Temperment</label>
                <textarea
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Personality"
                    value={temperament}
                    onChange={(e) => setTemperament(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                <textarea
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Special Instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                />
            </div>
            <button
                type="submit"
                className="btn btn-secondary"
            >
                Submit
            </button>
        </form>
    );
};

export default NewPet;
