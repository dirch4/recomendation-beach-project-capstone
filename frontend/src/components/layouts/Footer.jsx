import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#dcefff] text-white py-2 shadow-[0_-2px_6px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto py-2 text-center">
        <p className="text-sky-800">&copy; {new Date().getFullYear()} <span className='italic text-sky-500'>biru</span>Laut. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
