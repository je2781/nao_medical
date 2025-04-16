"use client";

import React, { useState } from "react";

const PrivacyNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const closeNotice = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div className="fixed w-full h-screen z-30 bg-transparent"></div>
      )}
      {isVisible && (
        <div className="fixed bottom-0 left-0 z-50 w-full text-white bg-black/80 p-5 text-center">
          <div className="max-w-[600px] my-0 mx-auto">
            <h3>Privacy Notice</h3>
            <p>
              This app processes speech and text temporarily to generate
              translations. No personal data, including medical terms, is stored
              or shared. We respect patient confidentiality. By using this app,
              you agree to our data handling practices.
            </p>
            <button
              className="text-white px-4 py-2 bg-[#f44336] cursor-pointer hover:bg-[#d32f2f] mt-6"
              onClick={closeNotice}
            >
              I Agree
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyNotice;
