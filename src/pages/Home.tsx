import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "../components/Cube";

import { Footer } from "../components/Footer"

import Presentation from '../img/Presentation.png';
import Test from '../img/Test.png';

export const Home = () => {
    return (
        <main>
            <section className='flex justify-evenly items-center w-full h-[90vh] bg-white'>
                <div className="flex justify-center items-center w-5/12">
                    <img src={ Presentation } className='z-10 w-11/12'/>
                </div>

                <div className='flex flex-col justify-center w-5/12'>
                    <h1 className='mb-4 text-7xl font-montserrat'>L’Art de la Figurine Personnalisée</h1>
                    <p className='font-montserrat'>
                        Bienvenue dans l'univers des figurines d'exception ! Que vous soyez collectionneur passionné ou 
                        amateur de pièces uniques, découvrez notre large sélection de figurines détaillées et de haute qualité. 
                        De vos personnages préférés aux éditions limitées, plongez dans un monde où chaque figurine raconte une 
                        histoire. Parcourez notre collection et donnez vie à votre passion dès aujourd'hui !
                    </p>
                </div>
            </section>

            <section className='flex justify-evenly items-center w-full py-40 bg-[#404040]'>
                <div className='flex flex-col justify-center w-5/12'>
                    <h1 className='mb-4 text-7xl font-montserrat text-white'>L'importance du détail</h1>
                    <p className='font-montserrat text-white'>
                        Chez nous, le souci du détail n'est pas une option, mais une véritable exigence. Nous nous engageons à perfectionner chacune de nos créations afin de garantir 
                        une expérience d'apprentissage à la fois riche et immersive. Notre objectif est d'élargir les horizons de nos utilisateurs en les guidant vers la découverte 
                        de concepts et de savoirs nouveaux, souvent méconnus ou inexplorés. Nous croyons fermement que chaque élément compte, car c'est dans la précision et la finesse 
                        que se trouvent les clés d'une compréhension approfondie et d'une expertise durable.
                    </p>
                </div>

                <div className="flex justify-center items-center w-5/12 h-[50vh]">
                    <Canvas className="w-full h-full" camera={{ position: [10, 5, 10], fov: 45 }}>
                        <ambientLight intensity={0.3} />
                        <directionalLight intensity={1} position={[5, 5, 5]} />
                        <Model />
                        <Environment preset="sunset" />
                    </Canvas>
                </div>
            </section>

            <section className='flex flex-col w-full py-40 bg-white'>
                <div className='flex justify-center items-center w-full'>
                    <h1 className='mb-4 text-7xl font-montserrat'>Nouveautés</h1>
                </div>

                <div className="flex justify-center items-center mt-8 w-full h-full">
                    <div className="flex justify-around w-3/4">
                        <div className='flex flex-col p-8 border rounded-2xl shadow-2xl duration-300 ease-out hover:border-[#529fa9] hover:scale-105 cursor-pointer'>
                            <div className='flex w-full overflow-hidden rounded-2xl'>
                                <img src={ Test } className='w-full' />
                            </div>

                            <div className='flex justify-between mt-4 w-full'>
                                <div className='flex'>
                                    <p className='font-montserrat'>Nouveau dino</p>
                                </div>

                                <div className='flex'>
                                    <p className='font-montserrat'>50€</p>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col mx-12 p-8 border rounded-2xl shadow-2xl duration-300 ease-out hover:border-[#529fa9] hover:scale-105 cursor-pointer'>
                            <div className='flex w-full overflow-hidden rounded-2xl'>
                                <img src={ Test } className='w-full' />
                            </div>

                            <div className='flex justify-between mt-4 w-full'>
                                <div className='flex'>
                                    <p className='font-montserrat'>Nouveau dino</p>
                                </div>

                                <div className='flex'>
                                    <p className='font-montserrat'>95€</p>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col p-8 border rounded-2xl shadow-2xl duration-300 ease-out hover:border-[#529fa9] hover:scale-105 cursor-pointer'>
                            <div className='flex w-full overflow-hidden rounded-2xl'>
                                <img src={ Test } className='w-full' />
                            </div>

                            <div className='flex justify-between mt-4 w-full'>
                                <div className='flex'>
                                    <p className='font-montserrat'>Nouveau robot</p>
                                </div>

                                <div className='flex'>
                                    <p className='font-montserrat'>120€</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>
        </main>
    );
}