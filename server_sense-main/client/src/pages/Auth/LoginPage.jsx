import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Threads from '../../pages/Threads/Threads';
import { authService } from '../../services/authService';

const LoginPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('admin'); // 'admin' | 'user'
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const data = await authService.login({
                username: values.username,
                password: values.password
            });

            message.success('Login successful');

            // Redirect based on selected portal and user permissions
            if (role === 'admin') {
                if (data.user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    message.info('Logged in with User role. Redirecting to User Dashboard...');
                    navigate('/user/dashboard');
                }
            } else {
                navigate('/user/dashboard');
            }
        } catch (error) {
            message.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans flex items-center justify-center">
            {/* Threads Background (Dimmed) */}
            <div className="absolute inset-0 z-0 opacity-30">
                <Threads
                    color={role === 'admin' ? [0.23, 0.51, 0.96] : [0.85, 0.27, 0.94]} // Blue for Admin, Purple for User
                    amplitude={1.5}
                    distance={0}
                    enableMouseInteraction={true}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505]/90 z-0 pointer-events-none" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50 overflow-hidden"
                >
                    {/* Role Selector */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-8 relative">
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-primary/20 rounded-lg transition-all duration-300 ease-in-out ${role === 'user' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                            style={{ backgroundColor: role === 'admin' ? '#0ea5e9' : '#d946ef' }}
                        />

                        <button
                            onClick={() => setRole('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'admin' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <SafetyCertificateOutlined className="text-lg" />
                            Admin Access
                        </button>
                        <button
                            onClick={() => setRole('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'user' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <TeamOutlined className="text-lg" />
                            User Access
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                {role === 'admin' ? 'System Login' : 'User Portal'}
                            </h1>
                            <p className="text-gray-400">
                                {role === 'admin'
                                    ? 'Enter credentials for full system control'
                                    : 'Access your personal dashboard & metrics'}
                            </p>
                        </motion.div>
                    </div>

                    <Form
                        name="login_form"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Please input your Username!' }]}
                        >
                            <Input
                                prefix={<UserOutlined className={`site-form-item-icon ${role === 'admin' ? 'text-primary' : 'text-secondary'}`} />}
                                placeholder="Username"
                                className="bg-black/20 border-gray-700 text-white hover:border-white/30 focus:border-white/50 placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className={`site-form-item-icon ${role === 'admin' ? 'text-primary' : 'text-secondary'}`} />}
                                placeholder="Password"
                                className="bg-black/20 border-gray-700 text-white hover:border-white/30 focus:border-white/50 placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>
                        <Form.Item>
                            <div className="flex justify-between items-center text-sm">
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox className="text-gray-400 hover:text-white">Remember me</Checkbox>
                                </Form.Item>

                                <a className={`transition-colors ${role === 'admin' ? 'text-primary hover:text-primary/80' : 'text-secondary hover:text-secondary/80'}`} href="">
                                    Forgot password?
                                </a>
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={`w-full h-12 border-none font-bold text-lg rounded-lg hover:scale-[1.02] transition-all duration-200 ${role === 'admin'
                                    ? 'bg-primary shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]'
                                    : 'bg-secondary shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]'
                                    }`}
                            >
                                Log in as {role === 'admin' ? 'Administrator' : 'User'}
                            </Button>
                        </Form.Item>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#0a0a0a] text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                icon={<GoogleOutlined />}
                                className="h-10 bg-white/5 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-white/10 rounded-lg"
                            >
                                Google
                            </Button>
                            <Button
                                icon={<GithubOutlined />}
                                className="h-10 bg-white/5 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-white/10 rounded-lg"
                            >
                                Github
                            </Button>
                        </div>
                    </Form>

                    <div className="mt-8 text-center text-gray-400 text-sm">
                        Don't have an account?
                        <Link
                            to="/register"
                            className={`font-semibold ml-1 ${role === 'admin' ? 'text-primary hover:text-primary/80' : 'text-secondary hover:text-secondary/80'}`}
                        >
                            Sign up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
