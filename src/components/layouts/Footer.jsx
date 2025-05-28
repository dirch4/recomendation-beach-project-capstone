import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2">&copy; {new Date().getFullYear()} MyWebsite. All rights reserved.</p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
