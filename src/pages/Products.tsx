import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Footer } from "../components/Footer"

import Test from '../img/Test.png';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
}

export const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
    const navigate = useNavigate();

    const products: Product[] = [
        { id: '1', name: 'Dino A', price: 50, category: 'dinosaur', image: Test },
        { id: '2', name: 'Robot B', price: 60, category: 'robot', image: Test },
        { id: '3', name: 'Arme C', price: 70, category: 'weapon', image: Test },
        { id: '4', name: 'Dino D', price: 50, category: 'dinosaur', image: Test },
        { id: '5', name: 'Robot E', price: 80, category: 'robot', image: Test },
        { id: '6', name: 'Dino F', price: 20, category: 'dinosaur', image: Test },
        { id: '7', name: 'Superhero G', price: 100, category: 'superhero', image: Test },
        { id: '8', name: 'Robot H', price: 60, category: 'robot', image: Test },
        { id: '9', name: 'Arme I', price: 70, category: 'weapon', image: Test },
        { id: '10', name: 'Dino J', price: 50, category: 'dinosaur', image: Test },
        { id: '11', name: 'Robot K', price: 80, category: 'robot', image: Test },
        { id: '12', name: 'Fantastic Creature L', price: 120, category: 'fantasticCreatures', image: Test },
        { id: '13', name: 'Arme M', price: 70, category: 'weapon', image: Test },
        { id: '14', name: 'Arme N', price: 70, category: 'weapon', image: Test },
        { id: '15', name: 'Robot O', price: 80, category: 'robot', image: Test },
        { id: '16', name: 'Vehicle P', price: 90, category: 'vehicle', image: Test },
        { id: '17', name: 'Superhero Q', price: 150, category: 'superhero', image: Test },
        { id: '18', name: 'Dino R', price: 60, category: 'dinosaur', image: Test },
        { id: '19', name: 'Historical Figure S', price: 200, category: 'historicalFigures', image: Test },
        { id: '20', name: 'Architecture T', price: 300, category: 'architecture', image: Test },
        { id: '21', name: 'Dino U', price: 40, category: 'dinosaur', image: Test },
        { id: '22', name: 'Robot V', price: 90, category: 'robot', image: Test },
        { id: '23', name: 'Arme W', price: 65, category: 'weapon', image: Test },
        { id: '24', name: 'Superhero X', price: 120, category: 'superhero', image: Test },
        { id: '25', name: 'Vehicle Y', price: 85, category: 'vehicle', image: Test },
        { id: '26', name: 'Fantastic Creature Z', price: 130, category: 'fantasticCreatures', image: Test },
        { id: '27', name: 'Dino AA', price: 55, category: 'dinosaur', image: Test },
        { id: '28', name: 'Robot BB', price: 95, category: 'robot', image: Test },
        { id: '29', name: 'Historical Figure CC', price: 180, category: 'historicalFigures', image: Test },
        { id: '30', name: 'Architecture DD', price: 280, category: 'architecture', image: Test },
        { id: '31', name: 'Dino EE', price: 45, category: 'dinosaur', image: Test },
        { id: '32', name: 'Robot FF', price: 100, category: 'robot', image: Test },
        { id: '33', name: 'Arme GG', price: 70, category: 'weapon', image: Test },
        { id: '34', name: 'Superhero HH', price: 160, category: 'superhero', image: Test },
        { id: '35', name: 'Vehicle II', price: 80, category: 'vehicle', image: Test },
        { id: '36', name: 'Fantastic Creature JJ', price: 110, category: 'fantasticCreatures', image: Test },
        { id: '37', name: 'Dino KK', price: 60, category: 'dinosaur', image: Test },
        { id: '38', name: 'Robot LL', price: 70, category: 'robot', image: Test },
        { id: '39', name: 'Historical Figure MM', price: 220, category: 'historicalFigures', image: Test },
        { id: '40', name: 'Architecture NN', price: 310, category: 'architecture', image: Test }
    ];

    const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedCategory(event.target.value);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (selectedCategory) {
            navigate(`/categorie/${selectedCategory}`);
        }
    };

    // Si la catégorie sélectionnée est 'all', on retourne tous les produits
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(product => product.category === selectedCategory);

    return (
        <main>
            <section className="flex w-full bg-white">
            <div className="flex flex-col items-center w-80 h-[80vh] pt-20">
                <h1 className="mb-4 text-4xl font-montserrat text-black">Catégories</h1>
                <div className='flex flex-col justify-center w-8/12'>
                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="all" checked={selectedCategory === 'all'} onChange={handleCategoryChange} className="mr-2"/>Tous
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="dinosaur" checked={selectedCategory === 'dinosaur'} onChange={handleCategoryChange} className="mr-2"/>Dinosaures
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="weapon" checked={selectedCategory === 'weapon'} onChange={handleCategoryChange} className="mr-2"/>Armes
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="robot" checked={selectedCategory === 'robot'} onChange={handleCategoryChange} className="mr-2"/>Robots
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="superhero" checked={selectedCategory === 'superhero'} onChange={handleCategoryChange} className="mr-2"/>Super-héros
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="vehicle" checked={selectedCategory === 'vehicle'} onChange={handleCategoryChange} className="mr-2"/>Véhicules
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="fantasticCreatures" checked={selectedCategory === 'fantasticCreatures'} onChange={handleCategoryChange} className="mr-2"/>Fantastiques
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="historicalFigures" checked={selectedCategory === 'historicalFigures'} onChange={handleCategoryChange} className="mr-2"/>Historiques
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="text-black font-montserrat">
                            <input type="radio" name="category" value="architecture" checked={selectedCategory === 'architecture'} onChange={handleCategoryChange} className="mr-2"/>Architecture
                        </label>
                    </div>
                </div>
            </div>

                <div className="grid gap-8 gap-y-16 grid-cols-4 p-8 w-full h-full">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className='flex flex-col p-8 border rounded-2xl shadow-2xl duration-300 ease-out hover:border-[#529fa9] hover:scale-105 cursor-pointer'>
                            <div className='flex w-full overflow-hidden rounded-2xl'>
                                <img src={product.image} className='w-full' alt={product.name} />
                            </div>

                            <div className='flex justify-between mt-4 w-full'>
                                <div className='flex'>
                                    <p className='font-montserrat'>{product.name}</p>
                                </div>

                                <div className='flex'>
                                    <p className='font-montserrat'>{product.price}€</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer/>
        </main>
    );
};