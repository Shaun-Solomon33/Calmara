import React from 'react';

const SirenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 4.5c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8" />
        <path d="M12 12.5c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3" />
        <path d="M12 2v2.5" />
        <path d="M12 20v-2.5" />
        <path d="M5.6 7.1 7 8.5" />
        <path d="M17 15.5l1.4 1.4" />
        <path d="M4.5 12H2" />
        <path d="M22 12h-2.5" />
        <path d="M18.4 7.1 17 8.5" />
        <path d="M7 15.5l-1.4 1.4" />
    </svg>
);

export default SirenIcon;
