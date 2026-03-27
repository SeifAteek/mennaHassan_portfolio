import React from 'react';

export default function Cover() {
    return (
        <div className="w-full h-[70vh] flex items-center justify-center overflow-hidden animate-fade-in rounded-2xl shadow-2xl dark:shadow-none">
            <img
                src="/IMG_1794.jpeg"
                alt="Main Cover"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-[2000ms]"
            />
        </div>
    );
}