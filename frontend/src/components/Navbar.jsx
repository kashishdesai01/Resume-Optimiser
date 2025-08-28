import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };
  
  const getLinkClass = ({ isActive }) =>
    isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 font-semibold hover:text-blue-600';

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Resume Optimizer
            </Link>
            {currentUser && (
              <div className="hidden md:flex items-center space-x-8">
                <NavLink to="/dashboard/tracker" className={getLinkClass}>
                  Job Tracker
                </NavLink>
                <NavLink to="/dashboard/documents" className={getLinkClass}>
                  Documents
                </NavLink>
                <NavLink to={"/dashboard/insights"} className={getLinkClass}>
                Insights
                </NavLink>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              // If currentUser prop exists, show Logout
              <button onClick={handleLogoutClick} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600">
                Logout
              </button>
            ) : (
              // If no currentUser, show Login and Register
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 font-semibold rounded-md hover:bg-gray-100">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;