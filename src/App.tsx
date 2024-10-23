import { Home } from './pages/Home'
import { About } from './pages/About'
import { Products } from './pages/Products'
import { Contact } from './pages/Contact'
import { Routes, Route, NavLink } from 'react-router-dom';

import Logo from './img/Logo.png'

import { CiSearch } from "react-icons/ci";

function App() {
  return (
    <div>
      <header className='flex justify-around items-center w-full h-[10vh] bg-white border-b'>
        <img src={ Logo } className='m-2 w-52'/>

        <nav className='flex items-center'>
          <NavLink className='m-2 p-2 font-montserrat text-base' style={({isActive}) => ({color: isActive ? '#529fa9' : '#696969'})} to={'/figurinum'}>Accueil</NavLink>
          {/* <NavLink className='m-2 p-2 font-montserrat text-base' style={({isActive}) => ({color: isActive ? '#529fa9' : '#696969'})} to={'/about'}>Figurinum</NavLink> */}
          <NavLink className='m-2 p-2 font-montserrat text-base' style={({isActive}) => ({color: isActive ? '#529fa9' : '#696969'})} to={'/products'}>Produits</NavLink>
          <NavLink className='m-2 p-2 font-montserrat text-base' style={({isActive}) => ({color: isActive ? '#529fa9' : '#696969'})} to={'/contact'}>Nous contacter</NavLink>

          <div className='relative flex items-center m-2 h-10'>
            <CiSearch className='absolute w-10 text-2xl'/>
            <input type="text" className='pl-10 w-72 h-full font-montserrat text-sm focus:outline outline-offset-2 outline-1 border rounded-md' placeholder='Rechercher un modèle'/>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path='/figurinum' element={ <Home/> }/>
        <Route path='/about' element={ <About/> }/>
        <Route path='/products' element={ <Products/> }/>
        <Route path='/contact' element={ <Contact/> }/>
      </Routes>
    </div>
  );
}

export default App;