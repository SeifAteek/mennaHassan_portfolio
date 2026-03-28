import React, { useState, useEffect, useRef } from 'react';
import Cover from './components/Cover';
import PortfolioGrid from './components/PortfolioGrid';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

function App() {
  const [activeTab, setActiveTab] = useState('cover');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [images, setImages] = useState([]);
  const [shoots, setShoots] = useState([]);
  const [selectedShoot, setSelectedShoot] = useState('All');

  const fetchPortfolioImages = () => {
    fetch(`${API_BASE}/api/images`)
        .then(res => res.json())
        .then(data => {
          setImages(data);
          const uniqueShoots = [...new Set(data.map(img => img.shoot_name))];
          setShoots(uniqueShoots);
        })
        .catch(err => console.error("Error fetching images:", err));
  };

  useEffect(() => {
    if (activeTab === 'portfolio') {
      fetchPortfolioImages();
    }
  }, [activeTab]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleShootSelection = (shoot) => {
    setActiveTab('portfolio');
    setSelectedShoot(shoot);
    setIsDropdownOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cover':
        return <Cover />;
      case 'portfolio':
        return <PortfolioGrid images={images} selectedShoot={selectedShoot} />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Cover />;
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-[#e8e6e1] dark:bg-[#121212] text-[#1a1a1a] dark:text-[#f4f4f4] font-sans transition-colors duration-700 relative overflow-hidden">

        <div className="fixed top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] md:blur-[120px] opacity-50 dark:opacity-20 animate-pulse pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] md:blur-[120px] opacity-50 dark:opacity-20 animate-pulse delay-700 pointer-events-none"></div>

        {/* FIXED HEADER PADDING: Changed py-6 to pt-16 pb-6 to push the text down on mobile */}
        <header className="sticky top-0 z-50 bg-[#e8e6e1]/70 dark:bg-[#121212]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 pt-16 pb-6 md:py-8 flex flex-col items-center transition-colors duration-700">

          <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="absolute top-4 right-4 md:top-6 md:right-12 text-[8px] md:text-[10px] uppercase tracking-[0.2em] border border-black/20 dark:border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 z-50 cursor-pointer"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* FIXED TEXT SIZING: Dropped text-3xl to text-2xl on mobile so it fits perfectly */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-2 md:mb-2 animate-fade-in relative z-10 text-center px-4 w-full">
            Menna Hassan
          </h1>

          <p className="text-[9px] md:text-sm tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-2 md:mb-2 uppercase animate-fade-in delay-100 relative z-10 text-center">
            Fashion Model / Content Creator
          </p>

          <p className="text-[9px] md:text-xs tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-6 md:mb-8 uppercase animate-fade-in delay-100 relative z-10 text-center">
            Height : 165 CM | Weight : 53 KG
          </p>

          <nav className="flex space-x-4 md:space-x-12 text-[10px] md:text-sm uppercase tracking-widest animate-fade-in delay-200 relative z-10">
            <button
                onClick={() => { setActiveTab('cover'); setIsDropdownOpen(false); }}
                className={`pb-2 transition-all duration-300 relative cursor-pointer ${activeTab === 'cover' ? 'text-black dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              Cover
              <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-black dark:bg-white transform origin-left transition-transform duration-300 ${activeTab === 'cover' ? 'scale-x-100' : 'scale-x-0'}`}></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`pb-2 transition-all duration-300 relative cursor-pointer ${activeTab === 'portfolio' ? 'text-black dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
              >
                Portfolio
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-black dark:bg-white transform origin-left transition-transform duration-300 ${activeTab === 'portfolio' ? 'scale-x-100' : 'scale-x-0'}`}></span>
              </button>

              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 md:w-48 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-xl transition-all duration-300 overflow-hidden flex flex-col py-2 z-[60] ${isDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <button
                    onClick={() => handleShootSelection('All')}
                    className={`px-4 py-3 text-[10px] text-center uppercase tracking-widest transition-colors ${selectedShoot === 'All' ? 'bg-black/10 dark:bg-white/20 text-black dark:text-white' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'}`}
                >
                  All Shoots
                </button>
                {shoots.map(shoot => (
                    <button
                        key={shoot}
                        onClick={() => handleShootSelection(shoot)}
                        className={`px-4 py-3 text-[10px] text-center uppercase tracking-widest transition-colors ${selectedShoot === shoot ? 'bg-black/10 dark:bg-white/20 text-black dark:text-white' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'}`}
                    >
                      {shoot}
                    </button>
                ))}
              </div>
            </div>

            <button
                onClick={() => { setActiveTab('contact'); setIsDropdownOpen(false); }}
                className={`pb-2 transition-all duration-300 relative cursor-pointer ${activeTab === 'contact' ? 'text-black dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-black dark:bg-white transform origin-left transition-transform duration-300 ${activeTab === 'contact' ? 'scale-x-100' : 'scale-x-0'}`}></span>
            </button>
          </nav>
        </header>

        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10 pb-24">
          {renderContent()}
        </main>

        <footer className="w-full py-6 text-center relative z-10">
          <button
              onClick={() => setActiveTab('admin')}
              className="text-[10px] tracking-[0.3em] uppercase text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300 opacity-50 hover:opacity-100 p-4"
          >
            Admin
          </button>
        </footer>
      </div>
  );
}

export default App;