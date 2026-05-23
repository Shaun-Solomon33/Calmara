import React from 'react';

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v5h5"/>
    <path d="M3.05 13A9 9 0 0 0 12 21a9 9 0 0 0 8.95-7"/>
    <path d="M21 21v-5h-5"/>
    <path d="M20.95 11A9 9 0 0 0 12 3a9 9 0 0 0-8.95 7"/>
  </svg>
);

export default HistoryIcon;
