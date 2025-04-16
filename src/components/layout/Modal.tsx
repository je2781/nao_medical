'use client';

import ReactDOM from "react-dom";
import React from "react";
import {
  BackDropProps,
  GuideModalProps,
  GuideModalOverlayProps,
} from "@/interfaces";

const BackDrop: React.FC<BackDropProps> = (props) => {
  return (
    <div
      className="w-full h-[100vh] top-0 left-0 fixed bg-black/70 z-30"
      onClick={props.onClick}
    ></div>
  );
};

const GuideModalOverlay: React.FC<GuideModalOverlayProps> = (props) => {
  return (
    <main
      id="guide"
      aria-orientation="vertical"
      aria-labelledby="toggle-guide"
      className="z-50 bg-white lg:w-[40%] lg:left-[30%] w-[85%] left-[7.5%] flex-col shadow-xl flex md:py-8 pt-12 pb-8 px-6 fixed top-[10vh] rounded-2xl"
    >
      {props.children}
      <i
        className="fa-solid fa-xmark text-xl absolute right-4 top-5 cursor-pointer text-gray-500"
        onClick={props.onClick}
      ></i>
    </main>
  );
};

export const GuideModal: React.FC<GuideModalProps> = (props) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose} />,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <GuideModalOverlay onClick={props.onClose}>
          {props.children}
        </GuideModalOverlay>,
        document.getElementById("guide-modal")!
      )}
    </>
  );
};
