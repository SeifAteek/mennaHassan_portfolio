import React, { useState } from 'react';

// This tells the app: "If we are live, use the Vercel URL. If local, use 3000."
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-xl mx-auto text-center mt-12 md:mt-20 animate-fade-in pb-12">
            <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-wide text-black dark:text-white transition-colors duration-700">Let's Chat!</h2>

            {/* Note: I noticed your screenshot says 05, but earlier code said 0. Make sure this matches exactly! */}
            <p className="mb-8 text-sm tracking-widest text-gray-600 dark:text-gray-400 uppercase transition-colors duration-700">
                MENNAMHASSAN05@GMAIL.COM
            </p>

            <div className="flex flex-col items-center justify-center mb-12">
                <img
                    src="/qr%20insta.jpeg"
                    width={100}
                    height={100}
                    alt="Instagram QR Code"
                    className="mx-auto rounded-lg shadow-sm border border-black/10 dark:border-white/10 mb-4 hover:scale-105 transition-transform duration-300"
                />
                <a
                    href="https://www.instagram.com/menna_hassan_._?igsh=YnJuNm9tNmQ3ZjM%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-widest uppercase hover:opacity-70 transition-opacity"
                    style={{ color: 'hotpink' }}
                >
                    Instagram
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 flex flex-col items-center w-full">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="name"
                    className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 tracking-wider text-sm transition-colors duration-300"
                />

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email"
                    className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 tracking-wider text-sm transition-colors duration-300"
                />

                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell me more about your project/ideas. The more details, the better!"
                    rows="4"
                    className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 tracking-wider text-sm resize-none mt-4 transition-colors duration-300"
                ></textarea>

                {status === 'success' && (
                    <p className="text-green-600 dark:text-green-400 text-sm tracking-widest uppercase mt-4">Message sent successfully!</p>
                )}
                {status === 'error' && (
                    <p className="text-red-500 text-sm tracking-widest uppercase mt-4">Failed to send. Please try again.</p>
                )}

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="mt-12 px-16 py-4 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'sending' ? 'Sending...' : 'Connect'}
                </button>
            </form>
        </div>
    );
}