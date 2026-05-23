import React from 'react';

const CommunicationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 9.5a2.5 2.5 0 0 1 0 5"/>
    <path d="M20 7a5 5 0 0 1 0 10"/>
    <path d="M2 12h1.5"/>
    <path d="M6.5 12H8"/>
    <path d="M11.5 12h1.5"/>
    <path d="M12 2a10 10 0 0 0-7.53 16.59l-1.9 1.9a.5.5 0 0 0 .35.85H12a10 10 0 0 0 10-10c0-1.55-.36-3-1-4.25"/>
  </svg>
);

export default CommunicationIcon;
