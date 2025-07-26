// import React from 'react';
// import './button.css';
// import {Link} from 'react-router-dom';

// const STYLES = ['btn--primary', 'btn--outline']

// const SIZES = ['btn--medidum', 'btn--outline'];

// export const Button = ({children, 
//                         type, 
//                         onClick, 
//                         to, 
//                         buttonStyle,
//                         buttonSize}) => {
//         const checkButtonStyle = STYLES.includes(buttonStyle) 
//         ? buttonStyle 
//         : STYLES[0]

//         const checkButtonSize = SIZES.includes(buttonSize) 
//         ? buttonSize
//         : SIZES[0]

//         if(to){
//             return(
//                 <Link to={to} className="btn-mobile">
//                 <button 
//                     className={'btn ${checkButtonStyle} ${checkButtonSize}'}
//                     type={type || 'button'}
//                     >
//                     {children}
//                     </button>
//                     </Link>
//             );
//         }
//         return(
//                 <button
//                 className={'btn ${checkButtonStyle} ${checkButtonSize}'}
//                 onClick={onClick}
//                 type={type || 'button'}
//                 >
//                     {children}
//                 </button>

//         );
//     };