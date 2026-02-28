import React from 'react';

const KenyaMapLogo = ({ size = 60, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="kenyaFlagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="50%" stopColor="#bf2f38" />
                    <stop offset="100%" stopColor="#00853e" />
                </linearGradient>
            </defs>

            {/* Abstract Kenya Map Shape */}
            <path
                d="M35,15 L65,10 L85,20 L95,50 L80,85 L50,95 L20,80 L5,50 L15,20 Z"
                fill="url(#kenyaFlagGradient)"
                stroke="none"
                opacity="0.9"
            />

            {/* LUK Text Overlay */}
            <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Arial, sans-serif"
                fontWeight="900"
                fontSize="28"
                fill="#ffffff"
                style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }}
            >
                LUK
            </text>
        </svg>
    );
};

export default KenyaMapLogo;
