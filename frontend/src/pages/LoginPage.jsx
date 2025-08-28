import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await AuthService.login(email, password);
            onLogin();
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to log in. Please check your credentials.';
            setError(errorMsg);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleLogin} className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Sign In</button>
                    <Link to="/register" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">Need an account?</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;