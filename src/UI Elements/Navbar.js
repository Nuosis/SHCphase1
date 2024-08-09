import React, { useState, useEffect } from 'react';
import altUserImage from '../images/c311444e-7884-4491-b760-c2e4c858d4ce.webp';
import { HouseOutlined } from '@mui/icons-material';
import SHC from '../images/SelectHome-StackedLogo-Pine&Lime.png';

const Navbar = ({ navigationConfig, handleComponentSelect, generateActivityRows, togglePreviousOrdersRef }) => {
  const [isPreviousOrdersOpen, setIsPreviousOrdersOpen] = useState(false);
  const [isAccountNavbarOpen, setIsAccountNavbarOpen] = useState(false);
  const [isMenubarOpen, setIsMenubarOpen] = useState(false);

  const activityRows = generateActivityRows(); // Call the passed function to generate activity rows

  // Handle the state of the open dropdown menus
  const togglePreviousOrders = () => {
    setIsPreviousOrdersOpen(!isPreviousOrdersOpen);
    setIsAccountNavbarOpen(false);
  };

  const toggleAccountNavbar = () => {
    setIsAccountNavbarOpen(!isAccountNavbarOpen);
    setIsPreviousOrdersOpen(false);
  };

  const toggleMenubar = () => setIsMenubarOpen(!isMenubarOpen);

  const handleNewOrder = () => {
    window.open('https://www.selecthomecleaning.ca', '_blank'); // Open in new tab
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('nav')) {
        // Click on nav do nothing
        return;
      } else {
        // If we have any panels open, close them
        if (isAccountNavbarOpen) setIsAccountNavbarOpen(false);
        if (isPreviousOrdersOpen) setIsPreviousOrdersOpen(false);
        if (isMenubarOpen) setIsMenubarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, false);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [isAccountNavbarOpen, isPreviousOrdersOpen, isMenubarOpen]);

  // Assign the togglePreviousOrders function to the ref's current property
  useEffect(() => {
    if (togglePreviousOrdersRef) {
      togglePreviousOrdersRef.current = togglePreviousOrders;
    }
  }, []);

  return (
    <nav className="bg-white shadow-lg border-gray-200 dark:bg-gray-900 dark:border-gray-700 sticky top-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
        <a href="https://selecthomecleaning.ca" className="flex items-center py-2 px-2 text-gray-700 hover:text-gray-900">
          <img src={SHC} className="max-h-12" alt="Select Home Cleaning" />
        </a>
        <button
          data-collapse-toggle="navbar-multi-level"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-multi-level"
          aria-expanded={isMenubarOpen}
          onClick={toggleMenubar}
        >
          <span className="sr-only">Menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>
        <div className={`w-full md:block md:w-auto  ${isMenubarOpen ? '' : 'hidden'}`} id="navbar-multi-level">
          <ul className="flex flex-col font-medium p-4 md:p-0 mx-6 my-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {Object.entries(navigationConfig).map(([key, item]) => {
              if (item.dropdown) {
                return (
                  <li key={key}>
                    <button
                      className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                      onClick={() => key === 'previousOrders' ? togglePreviousOrders() : toggleAccountNavbar()}
                    >
                      <i className={item.icon}></i>
                      <p className="pl-2">{item.label}</p>
                      <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                      </svg>
                    </button>
                    <div className={`z-10 ${key === 'previousOrders' ? isPreviousOrdersOpen : isAccountNavbarOpen ? '' : 'hidden'} absolute font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
                      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                        {key === 'previousOrders'
                          ? activityRows.flat()
                          : item.items.map((subItem, index) => (
                            <li key={index}>
                              <button onClick={() => { handleComponentSelect(subItem.component); togglePreviousOrdersRef.current(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                                {subItem.label}
                              </button>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </li>
                );
              } else {
                return (
                  <button
                    key={key}
                    className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                    onClick={item.label === 'New Order' ? handleNewOrder : item.action}
                  >
                    <item.icon style={{ fontSize: '2.1rem' }}></item.icon>
                    <p className="pl-2">{item.label}</p>
                  </button>
                );
              }
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;