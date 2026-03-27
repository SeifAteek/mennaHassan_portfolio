import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function AdminDashboard() {
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
    const [loginError, setLoginError] = useState('');

    const [files, setFiles] = useState([]);
    const [shootName, setShootName] = useState('');
    const [shootDate, setShootDate] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [adminImages, setAdminImages] = useState([]);

    const fetchAdminImages = () => {
        fetch(`${API_BASE}/api/images`)
            .then(res => res.json())
            .then(data => setAdminImages(data))
            .catch(err => console.error("Error fetching admin images:", err));
    };

    useEffect(() => {
        if (token) fetchAdminImages();
    }, [token]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                localStorage.setItem('adminToken', data.token);
            } else {
                setLoginError(data.error || 'Login failed');
            }
        } catch (error) {
            setLoginError('Server error. Please try again later.');
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('adminToken');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0 || !shootName || !shootDate) {
            alert('Please fill out all fields and select at least one image.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        formData.append('shoot_name', shootName);
        formData.append('shoot_date', shootDate);

        try {
            const response = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                setFiles([]);
                setShootName('');
                setShootDate('');
                document.getElementById('file-upload').value = "";
                fetchAdminImages();
                alert('Album uploaded to cloud successfully!');
            } else {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    alert('Session expired. Please log in again.');
                } else {
                    alert(errorData.error || 'Upload failed.');
                }
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image? It will be removed from the cloud.')) return;

        try {
            const response = await fetch(`${API_BASE}/api/images/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchAdminImages();
            } else if (response.status === 401 || response.status === 403) {
                handleLogout();
                alert('Session expired. Please log in again.');
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-4">
                <div className="p-8 md:p-12 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl w-full max-w-md relative">
                    <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase mb-8 text-center text-black dark:text-white">Manager Access</h2>
                    <form onSubmit={handleLogin} className="flex flex-col space-y-6">
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white text-center tracking-widest transition-colors duration-300"
                        />
                        {loginError && <p className="text-red-500 text-xs text-center uppercase tracking-widest">{loginError}</p>}
                        <button
                            type="submit"
                            className="px-8 py-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 uppercase tracking-widest text-xs rounded-full"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto px-2 md:px-0">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-black/10 dark:border-white/10 pb-6 mb-8 md:mb-12 space-y-4 md:space-y-0">
                <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] uppercase text-black dark:text-white">Dashboard</h2>
                <button
                    onClick={handleLogout}
                    className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                >
                    Log Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-1 h-fit p-6 md:p-8 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl">
                    <h3 className="text-xs md:text-sm font-light tracking-[0.2em] uppercase mb-6 text-black dark:text-white">Upload Photos</h3>
                    <form onSubmit={handleUpload} className="flex flex-col space-y-6">
                        <div className="relative">
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setFiles(Array.from(e.target.files))}
                                className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:md:text-xs file:uppercase file:tracking-widest file:bg-black/5 dark:file:bg-white/10 file:text-black dark:file:text-white hover:file:bg-black/10 dark:hover:file:bg-white/20 transition-all cursor-pointer"
                            />
                            {files.length > 0 && <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 uppercase tracking-widest">{files.length} file(s) selected</p>}
                        </div>
                        <input
                            type="text"
                            placeholder="Shoot Name (e.g., Vogue Summer)"
                            value={shootName}
                            onChange={(e) => setShootName(e.target.value)}
                            className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-500 tracking-wider text-xs transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Date (e.g., March 2026)"
                            value={shootDate}
                            onChange={(e) => setShootDate(e.target.value)}
                            className="w-full bg-transparent border-b border-black/30 dark:border-white/30 text-black dark:text-white py-2 focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-500 tracking-wider text-xs transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="mt-4 px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 uppercase tracking-widest text-xs rounded-full disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Album'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl">
                    <h3 className="text-xs md:text-sm font-light tracking-[0.2em] uppercase mb-6 text-black dark:text-white">Manage Portfolio ({adminImages.length})</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        {adminImages.map((img) => (
                            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square bg-black/5 dark:bg-white/5">
                                <img
                                    src={img.image_url}
                                    alt={img.shoot_name}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-black/20 dark:bg-black/40 backdrop-blur-sm">
                  <span className="text-[10px] text-white font-bold tracking-widest uppercase text-center mb-2 drop-shadow-md">
                    {img.shoot_name}
                  </span>
                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="px-3 py-2 md:px-4 bg-red-500/90 hover:bg-red-600 text-white text-[10px] uppercase tracking-widest rounded-full transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {adminImages.length === 0 && (
                            <div className="col-span-full text-center text-[10px] md:text-xs text-gray-500 tracking-widest uppercase py-12">
                                No images uploaded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}