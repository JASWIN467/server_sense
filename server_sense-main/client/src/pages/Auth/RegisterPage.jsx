import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, GithubOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Threads from '../../pages/Threads/Threads';
import { authService } from '../../services/authService';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('user'); // 'user' | 'admin'
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await authService.register({
                username: values.username,
                password: values.password,
                email: values.email,
                role: role
            });
            message.success(`Registration successful as ${role}! Please login.`);
            navigate('/login');
        } catch (error) {
            message.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-background font-sans flex items-center justify-center">
            {/* Threads Background (Dimmed) */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Threads
                    color={role === 'admin' ? [0.23, 0.51, 0.96] : [0.85, 0.27, 0.94]}
                    amplitude={1.5}
                    distance={0}
                    enableMouseInteraction={true}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/90 z-0 pointer-events-none" />

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50"
                >
                    {/* Role Selector */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-6 relative">
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-in-out ${role === 'admin' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                            style={{ backgroundColor: role === 'admin' ? '#0ea5e9' : '#d946ef' }}
                        />

                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'user' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <TeamOutlined className="text-base" />
                            User
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'admin' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <SafetyCertificateOutlined className="text-base" />
                            Admin
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Create Account</h1>
                        <p className="text-gray-400 text-sm">Join ServerSense as {role === 'admin' ? 'an Administrator' : 'a Standard User'}</p>
                    </div>

                    <Form
                        name="register"
                        className="register-form"
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
                                prefix={<UserOutlined className="site-form-item-icon text-primary" />}
                                placeholder="Username"
                                className="bg-black/20 border-gray-700 text-white hover:border-primary focus:border-primary placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'The input is not valid E-mail!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="site-form-item-icon text-primary" />}
                                placeholder="Email"
                                className="bg-black/20 border-gray-700 text-white hover:border-primary focus:border-primary placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon text-primary" />}
                                type="password"
                                placeholder="Password"
                                className="bg-black/20 border-gray-700 text-white hover:border-primary focus:border-primary placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirm"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon text-primary" />}
                                type="password"
                                placeholder="Confirm Password"
                                className="bg-black/20 border-gray-700 text-white hover:border-primary focus:border-primary placeholder-gray-500 rounded-lg h-12"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full h-12 bg-primary border-none shadow-neon-blue font-bold text-lg rounded-lg hover:scale-[1.02] transition-transform duration-200"
                            >
                                Sign Up
                            </Button>
                        </Form.Item>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-500 bg-surface">Or sign up with</span>
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
                        Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary/80 ml-1">Log in</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
