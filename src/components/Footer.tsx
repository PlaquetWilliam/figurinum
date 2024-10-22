import { Link } from 'react-router-dom';

import { CiTwitter } from "react-icons/ci";
import { CiInstagram } from "react-icons/ci";
import { IoIosStarOutline } from "react-icons/io";
import { IoIosStarHalf } from "react-icons/io";
import { IoIosStar } from "react-icons/io";

export const Footer = () => {
  return (
    <main>
        <section className="flex py-20 bg-[#404040]">
            <div className='flex justify-evenly w-full'>
                <div className="flex flex-col w-1/5 h-full p-8">
                    <h1 className="mb-4 w-full text-white uppercase font-bold">Infos importantes</h1>
                    <Link to="/figurinum" className='mb-2 text-white'>Accueil</Link>
                    <Link to="/Refund" className='text-white'>Demander remboursement</Link>
                </div>

                <div className="flex flex-col w-1/5 h-full p-8">
                    <h1 className="mb-4 w-full text-white uppercase font-bold">À propos</h1>
                    <Link to="/About" className='mb-2 text-white'>Figurinum</Link>
                    <Link to="/Conditions" className='mb-2 text-white'>Conditions Générales de Vente</Link>
                    <Link to="/Terms" className='text-white'>Mentions légales</Link>
                </div>

                <div className="flex flex-col w-1/5 h-full p-8">
                    <h1 className="mb-4 w-full text-white uppercase font-bold">Contact</h1>
                    <Link to="/Contact" className='text-white mb-2'>Nous contacter</Link>
                    <p className='text-white'>figurinum@contact.fr</p>
                </div>

                <div className="flex flex-col w-1/5 h-full p-8">
                    <h1 className="mb-4 w-full text-white uppercase font-bold">Newsletter</h1>
                    <p className='mb-2 text-white'>Ne manquez les nouveautés</p>
                    <input type="text" className='p-2 outline-none text-white font-montserrat text-sm border rounded-md bg-transparent' placeholder='Saisissez votre Email'/>
                </div>
            </div>
        </section>

        <section>
            <div className='flex justify-around items-center py-4 w-full bg-[#404040]'>
                <div className='flex'>
                    <h1 className='mr-4 text-white text-4xl'>3.5/5</h1>

                    <div className='flex items-center'>
                        <IoIosStar className='mr-1 text-yellow-400 text-2xl'/>
                        <IoIosStar className='mr-1 text-yellow-400 text-2xl'/>
                        <IoIosStar className='mr-1 text-yellow-400 text-2xl'/>
                        <IoIosStarHalf className='mr-1 text-yellow-400 text-2xl'/>
                        <IoIosStarOutline className='text-yellow-400 text-2xl'/>
                    </div>
                </div>

                <div className='flex'>
                    <div className='flex justify-center items-center mr-4 w-12 h-12 rounded-full border'>
                        <CiTwitter className='w-3/4 h-3/4 text-white'/>
                    </div>

                    <div className='flex justify-center items-center w-12 h-12 rounded-full border'>
                        <CiInstagram className='w-3/4 h-3/4 text-white'/>
                    </div>
                </div>
            </div>
        </section>
    </main>
  );
};