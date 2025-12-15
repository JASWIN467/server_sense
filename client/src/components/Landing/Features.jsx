import React from 'react';
import { Card } from 'antd';
import { RocketOutlined, SafetyCertificateOutlined, AlertOutlined, CloudServerOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const features = [
    {
        title: 'Real-time Metrics',
        description: 'Monitor CPU, Memory, and Network usage with millisecond precision.',
        icon: <RocketOutlined className="text-3xl text-primary" />,
    },
    {
        title: 'Instant Alerts',
        description: 'Get notified via Slack, Email, or SMS the moment something goes wrong.',
        icon: <AlertOutlined className="text-3xl text-red-500" />,
    },
    {
        title: 'Secure by Design',
        description: 'Enterprise-grade encryption and role-based access control.',
        icon: <SafetyCertificateOutlined className="text-3xl text-green-500" />,
    },
    {
        title: 'Cloud Native',
        description: 'Deploy anywhere. Support for AWS, Azure, GCP, and on-premise.',
        icon: <CloudServerOutlined className="text-3xl text-purple-500" />,
    },
];

const Features = () => {
    return (
        <div className="py-24 bg-surface text-white relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                        <span className="neon-text-purple">Why ServerSense?</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Built for developers who value <span className="text-white font-medium">performance, aesthetics,</span> and <span className="text-white font-medium">precision</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <div
                                className="h-full p-8 rounded-2xl neon-box transition-all duration-300 hover:-translate-y-2 group cursor-default"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-background border border-gray-800 group-hover:border-primary/50 group-hover:shadow-neon-blue transition-all duration-300 w-fit">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
