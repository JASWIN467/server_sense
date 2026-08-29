import React from 'react';
import { motion } from 'framer-motion';
import {
    TeamOutlined,
    LockOutlined,
    DatabaseOutlined,
    SecurityScanOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const securityFeatures = [
    {
        title: 'Role-Based Access Control',
        icon: <TeamOutlined className="text-4xl text-primary" />,
        content: [
            { label: 'Admin', text: 'Full system access & control', color: 'text-white' },
            { label: 'User', text: 'View-only access privileges', color: 'text-gray-400' },
            { label: 'Security', text: 'Strict permission boundaries', color: 'text-primary' }
        ]
    },
    {
        title: 'Login Process',
        icon: <LockOutlined className="text-4xl text-secondary" />,
        content: [
            { label: 'Auth', text: 'Secure credential validation', color: 'text-white' },
            { label: 'ID', text: 'Role identification on entry', color: 'text-gray-400' },
            { label: 'Access', text: 'Controlled entry gateways', color: 'text-secondary' }
        ]
    },
    {
        title: 'Session Management',
        icon: <DatabaseOutlined className="text-4xl text-accent" />,
        content: [
            { label: 'Storage', text: 'Encrypted localStorage', color: 'text-white' },
            { label: 'Persist', text: 'Remains active across refresh', color: 'text-gray-400' },
            { label: 'Logout', text: 'Secure session termination', color: 'text-accent' }
        ]
    },
    {
        title: 'Route Protection',
        icon: <SecurityScanOutlined className="text-4xl text-green-500" />,
        content: [
            { label: 'Guard', text: 'Admin-only protected routes', color: 'text-white' },
            { label: 'Redirect', text: 'Unauthorized access prevention', color: 'text-gray-400' },
            { label: 'Control', text: 'Role-specific navigation', color: 'text-green-500' }
        ]
    }
];

const SecurityFeatures = () => {
    return (
        <div className="py-24 bg-[#050505] relative overflow-hidden">
            {/* Diagonal Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
                        Enterprise <span className="text-primary drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">Security</span>
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Built from the ground up with <span className="text-white font-medium">security-first principles</span>, ensuring your infrastructure data remains uncompromisingly secure.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {securityFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                            <div className="relative h-full bg-[#0a0a0a] border border-white/10 hover:border-primary/50 p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:-translate-y-1">
                                <div className="flex items-start gap-5 sm:gap-6">
                                    <div className="flex-shrink-0 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors duration-300">
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors truncate">
                                            {feature.title}
                                        </h3>
                                        <div className="space-y-3">
                                            {feature.content.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <CheckCircleOutlined className="mt-1.5 text-primary/70 flex-shrink-0" />
                                                    <div className="text-sm leading-relaxed">
                                                        <span className={`inline-block font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-white/5 mr-2 mb-1 ${item.color.replace('text-', 'text-opacity-90 text-')}`}>
                                                            {item.label}
                                                        </span>
                                                        <span className="text-gray-400 font-medium">{item.text}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecurityFeatures;
