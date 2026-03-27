import React, { useState } from 'react';
import { createPortal } from 'react-dom';
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function PortfolioGrid({ images, selectedShoot }) {
    const [selectedImage, setSelectedImage] = useState(null);

    const displayImages = selectedShoot === 'All'
        ? images
        : images.filter(img => img.shoot_name === selectedShoot);

    const handleInteraction = async (type) => {
        if (!selectedImage) return;

        const updatedImage = { ...selectedImage, [type]: selectedImage[type] + 1 };
        setSelectedImage(updatedImage);

        try {
            await fetch(`${API_BASE}/api/images/${selectedImage.id}/${type.slice(0, -1)}`, { method: 'POST' });
            if (type === 'shares') {
                navigator.clipboard.writeText(window.location.href);
                alert('Portfolio link copied to clipboard!');
            }
        } catch (error) {
            console.error(`Error processing ${type}:`, error);
        }
    };

    if (displayImages.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20 tracking-widest uppercase animate-fade-in">
                {selectedShoot === 'All' ? 'No images uploaded yet.' : `No images found for ${selectedShoot}.`}
            </div>
        );
    }

    const renderLightbox = () => {
        if (!selectedImage) return null;

        return createPortal(
            <div
                className="fixed inset-0 bg-white/90 dark:bg-black/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-4 md:p-12 transition-opacity duration-500"
                onClick={() => setSelectedImage(null)}
            >
                <button
                    className="absolute top-6 right-8 text-black dark:text-white text-4xl hover:text-gray-500 dark:hover:text-gray-400 transition-all hover:rotate-90 duration-300 cursor-pointer z-[110]"
                    onClick={() => setSelectedImage(null)}
                >
                    &times;
                </button>

                {/* Notice we are using the direct cloud URL here! */}
                <img
                    src={selectedImage.image_url}
                    alt={selectedImage.shoot_name}
                    className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm animate-fade-in relative z-[105]"
                    onClick={(e) => e.stopPropagation()}
                />

                <div className="mt-8 flex flex-col items-center space-y-4 animate-fade-in delay-100 z-[105]" onClick={(e) => e.stopPropagation()}>
                    <div className="text-center">
                        <h3 className="text-lg tracking-[0.2em] uppercase font-light text-black dark:text-white">{selectedImage.shoot_name}</h3>
                        <p className="text-xs tracking-widest text-gray-500 uppercase mt-1">{selectedImage.shoot_date}</p>
                    </div>

                    <div className="flex items-center space-x-6 bg-black/5 dark:bg-white/10 px-6 py-3 rounded-full">
                        <button
                            onClick={() => handleInteraction('likes')}
                            className="flex items-center space-x-2 text-sm tracking-widest uppercase hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer group text-black dark:text-white"
                        >
                            <span className="text-lg group-active:scale-125 transition-transform duration-200">♡</span>
                            <span>{selectedImage.likes}</span>
                        </button>
                        <div className="w-[1px] h-4 bg-black/20 dark:bg-white/20"></div>
                        <button
                            onClick={() => handleInteraction('shares')}
                            className="flex items-center space-x-2 text-sm tracking-widest uppercase hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer group text-black dark:text-white"
                        >
                            <span className="text-lg group-active:scale-125 transition-transform duration-200">↗</span>
                            <span>{selectedImage.shares}</span>
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-xl tracking-[0.3em] font-light uppercase text-gray-800 dark:text-gray-200">{selectedShoot}</h2>
            </div>

            <div className="p-4 md:p-8 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl dark:shadow-2xl transition-all duration-700">
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {displayImages.map((img) => (
                        <div
                            key={img.id}
                            className="break-inside-avoid overflow-hidden cursor-pointer group rounded-xl shadow-sm hover:shadow-xl transition-all duration-500"
                            onClick={() => setSelectedImage(img)}
                        >
                            {/* And using the direct cloud URL here! */}
                            <img
                                src={img.image_url}
                                alt={img.shoot_name}
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {renderLightbox()}
        </div>
    );
}