
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const InputField = ({ id, type, value, onChange, placeholder, isValid }) => {
    const [isFocused, setIsFocused] = useState(false);
    const borderClass = isFocused ? 'border-blue-500 ring-2 ring-blue-200' :
                        (value && !isValid) ? 'border-red-400 ring-2 ring-red-100' :
                        'border-gray-300';

    return (
        <div className="relative">
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none ${borderClass}`}
                placeholder={placeholder}
                required
            />
        </div>
    );
};

// --- Reusable Password Requirements Component ---
const PasswordRequirements = ({ checks }) => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1">
        {Object.entries(checks).map(([key, { label, isValid }]) => (
            <p key={key} className={`text-sm flex items-center gap-2 transition-colors duration-300 ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-transform duration-200 ${isValid ? 'bg-green-500 text-white scale-110' : 'bg-gray-300'}`}>{isValid && '✓'}</span>
                {label}
            </p>
        ))}
    </div>
);

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setError('');
    };

    const validation = useMemo(() => {
        const { email, password, confirmPassword } = formData;
        const checks = {
            email: { label: 'Valid email format', isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) },
            length: { label: 'At least 8 characters', isValid: password.length >= 8 },
            uppercase: { label: 'One uppercase letter', isValid: /[A-Z]/.test(password) },
            lowercase: { label: 'One lowercase letter', isValid: /[a-z]/.test(password) },
            number: { label: 'One number', isValid: /\d/.test(password) },
            specialChar: { label: 'One special character', isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
            match: { label: 'Passwords match', isValid: password && password === confirmPassword },
        };
        const isPasswordCoreValid = ['length', 'uppercase', 'lowercase', 'number', 'specialChar'].every(key => checks[key].isValid);
        const isFormValid = formData.name.trim() && checks.email.isValid && isPasswordCoreValid && checks.match.isValid;
        return { checks, isPasswordCoreValid, isFormValid };
    }, [formData]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validation.isFormValid) {
            setError("Please ensure all fields are valid.");
            return;
        }
        setIsLoading(true);
        try {
            await AuthService.register(formData.name, formData.email, formData.password);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Failed to register. Email may be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                <p className="text-gray-600">Start optimizing your career path today.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Full Name" isValid={!!formData.name.trim()} />
                <InputField id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" isValid={validation.checks.email.isValid} />
                <InputField id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Create Password" isValid={validation.isPasswordCoreValid} />
                <InputField id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" isValid={validation.checks.match.isValid} />
                
                {(formData.password || formData.confirmPassword) && <PasswordRequirements checks={validation.checks} />}
                
                {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
                
                <button type="submit" disabled={!validation.isFormValid || isLoading} className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105 disabled:scale-100">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                
                <p className="text-center text-sm text-gray-600 pt-4 border-t">
                    Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
