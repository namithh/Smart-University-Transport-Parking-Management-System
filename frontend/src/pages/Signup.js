import React, { useState } from 'react';
import loginIcons from '../assest/profile.png';
import { Link, useNavigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const Signup = () => {
    const [data, setData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmpassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // ── Password strength logic ──────────────────────────────────────────────
    const passwordRules = [
        { id: 'length',    label: 'At least 8 characters',         test: (p) => p.length >= 8 },
        { id: 'uppercase', label: 'One uppercase letter (A-Z)',     test: (p) => /[A-Z]/.test(p) },
        { id: 'lowercase', label: 'One lowercase letter (a-z)',     test: (p) => /[a-z]/.test(p) },
        { id: 'number',    label: 'One number (0-9)',               test: (p) => /[0-9]/.test(p) },
        { id: 'special',   label: 'One special character (!@#$…)',  test: (p) => /[^A-Za-z0-9]/.test(p) },
    ];

    const getStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        const passed = passwordRules.filter((r) => r.test(password)).length;
        if (passed <= 2) return { score: passed, label: 'Weak',   color: '#ef4444' };
        if (passed === 3) return { score: passed, label: 'Fair',   color: '#f97316' };
        if (passed === 4) return { score: passed, label: 'Good',   color: '#eab308' };
        return              { score: passed, label: 'Strong', color: '#22c55e' };
    };

    const strength = getStrength(data.password);
    // ────────────────────────────────────────────────────────────────────────

    const handleOnChange = (e) => {
        const { name, value } = e.target;

            // Allow only letters and spaces for name
    if (name === "name") {
        const regex = /^[A-Za-z\s]*$/;
        if (!regex.test(value)) {
            return; // stop updating if invalid
        }
    }


        setData((preve) => ({ ...preve, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // ── Validation ───────────────────────────────────────────────────────
        const failedRules = passwordRules.filter((r) => !r.test(data.password));
        if (failedRules.length > 0) {
            toast.error(`Password must have: ${failedRules.map((r) => r.label.toLowerCase()).join(', ')}`);
            setIsLoading(false);
            return;
        }

        if (data.password !== data.confirmpassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }
        // ────────────────────────────────────────────────────────────────────

        try {
            const dataResponse = await fetch(SummaryApi.signUP.url, {
                method: SummaryApi.signUP.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const dataApi = await dataResponse.json();

            if (dataApi.success) {
                toast.success(dataApi.message);
                navigate('/login');
            } else if (dataApi.error) {
                toast.error(dataApi.message);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Decorative Header */}
                <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 shadow-lg">
                        <img src={loginIcons} alt="signup icons" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white">Create Account</h2>
                </div>

                <form className="px-8 py-6" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
    type="text"
    id="name"
    placeholder="Enter your full name"
    name="name"
    value={data.name}
    onChange={handleOnChange}
    pattern="[A-Za-z\s]+"
    title="Only letters and spaces allowed"
    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition duration-150 ease-in-out"
    required
/>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                name="email"
                                value={data.email}
                                onChange={handleOnChange}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                name="password"
                                value={data.password}
                                onChange={handleOnChange}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                required
                            />
                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={togglePasswordVisibility}>
                                {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* ── Strength meter (only shown when user starts typing) ── */}
                        {data.password && (
                            <div className="mt-2">
                                {/* Segmented bar */}
                                <div className="flex gap-1 mb-1">
                                    {passwordRules.map((rule, i) => (
                                        <div
                                            key={rule.id}
                                            className="h-1 flex-1 rounded-full transition-all duration-300"
                                            style={{
                                                backgroundColor: i < strength.score ? strength.color : '#e5e7eb',
                                            }}
                                        />
                                    ))}
                                </div>
                                {/* Label */}
                                <p className="text-xs font-medium" style={{ color: strength.color }}>
                                    {strength.label} password
                                </p>
                                {/* Checklist */}
                                <ul className="mt-2 space-y-1">
                                    {passwordRules.map((rule) => {
                                        const passed = rule.test(data.password);
                                        return (
                                            <li key={rule.id} className="flex items-center gap-1.5 text-xs" style={{ color: passed ? '#16a34a' : '#6b7280' }}>
                                                {passed ? (
                                                    <svg className="h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {rule.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {/* ───────────────────────────────────────────────────── */}
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmpassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmpassword"
                                placeholder="Re-enter your password"
                                name="confirmpassword"
                                value={data.confirmpassword}
                                onChange={handleOnChange}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                required
                            />
                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? (
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* ── Confirm password match hint ── */}
                        {data.confirmpassword && (
                            <p
                                className="text-xs mt-1"
                                style={{ color: data.password === data.confirmpassword ? '#16a34a' : '#ef4444' }}
                            >
                                {data.password === data.confirmpassword ? 'Passwords match' : 'Passwords do not match'}
                            </p>
                        )}
                        {/* ─────────────────────────────── */}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isLoading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="bg-gray-50 px-8 py-4 rounded-b-2xl">
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-green-600 hover:text-green-800 transition duration-150 ease-in-out">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Signup;