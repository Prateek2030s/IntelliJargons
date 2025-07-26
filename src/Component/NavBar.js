import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import { Button } from './button';
import './NavBar.css';
import Upload from '../Page/Upload';
import Reader from '../Page/Reader';
import Glossary from '../Page/Glossary';
import GenAI from '../Page/GenAI';
import {supabase} from '../App';

function NavBar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);


  const handleClick = () => setClick(! click);
  const closeMobileMenu = () => setClick(false);

  async function handleLogOut(){
  const {error} = await supabase.auth.signOut({ scope: 'local' })
  if(error != null){
    console.error('Error logging out!' + error.message);
  }
}

  const showButton = () =>{
    if(window.innerWidth <= 960){
      setButton(false);
    }else{
      setButton(true);
    }
  };

  return (
    <>
      <nav className = "navbar">
        <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
         IntelliJargons
          <i class='fab fa-typo3' />
            </Link>
            <div className='menu-icon' onClick={handleClick}>
              <i className={click ? 'fa-times': 'fas fa-bars'}/>
              </div>  
              <ul className ={click ? 'nav-menu active' : 'nav-menu'}>
                <li className='nav-item'>
                  <Link to='/upload' className='nav-links' onClick={closeMobileMenu}>
                  Upload
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to='/reader' className='nav-links' onClick={closeMobileMenu}>
                  Reader
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to='/glossary' className='nav-links' onClick={closeMobileMenu}>
                  Glossary
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to='/GenAI' className='nav-links' onClick={closeMobileMenu}>
                  GenAI
                  </Link>
                </li>
                </ul>
            {<Button 
                buttonStyle='btn-outline'
                onClick={handleLogOut}>
                  Log out
                </Button>
            }
           </div>
        </nav>
     </>
  );
}

export default NavBar
