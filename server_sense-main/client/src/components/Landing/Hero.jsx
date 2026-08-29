import React, { useState } from 'react';
import Threads from '../../pages/Threads/Threads';
import { Button, Modal } from 'antd';
import { ArrowRightOutlined, GlobalOutlined, CloseOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-background font-sans">
            {/* Threads Background */}
            <div className="absolute inset-0 z-0 opacity-80">
                <Threads
                    color={[0.23, 0.51, 0.96]} // Neon Blueish
                    amplitude={1.5}
                    distance={0}
                    enableMouseInteraction={true}
                />
            </div>

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90 z-0 pointer-events-none" />

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="pointer-events-auto max-w-4xl"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        SERVER<span className="text-primary/90 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">SENSE</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        Experience infrastructure observability with <span className="text-primary font-semibold">zero latency</span> and <span className="text-secondary font-semibold">futuristic visuals</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/register">
                            <Button
                                type="primary"
                                size="large"
                                shape="round"
                                icon={<ArrowRightOutlined />}
                                className="h-14 px-10 text-lg font-bold bg-primary border-none shadow-neon-blue hover:scale-105 transition-transform duration-200"
                            >
                                Get Started
                            </Button>
                        </Link>

                        <Button
                            size="large"
                            shape="round"
                            icon={<GlobalOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            className="bg-transparent !text-white !border-white/30 hover:!text-primary hover:!border-primary hover:!shadow-neon-blue hover:bg-white/5 transition-all duration-300 backdrop-blur-sm h-14 px-10 text-lg font-bold"
                        >
                            Live Demo
                        </Button>
                    </div>
                </motion.div>
            </div>

            <Modal
                title={null}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                closable={true}
                closeIcon={
                    <div className="flex items-center justify-center w-9 h-9 bg-black rounded-full border border-white/20 shadow-lg hover:bg-gray-900 transition-colors">
                        <CloseOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                }
                width={800}
                centered
                destroyOnClose={true}
                styles={{
                    content: {
                        padding: '4px',
                        backgroundColor: '#0a0a0a', // Dark base
                        boxShadow: '0 0 40px rgba(14, 165, 233, 0.25)', // Enhanced glow
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                    },
                    mask: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }
                }}
            >
                <div className="relative pt-[56.25%] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-black">
                    <video
                        className="absolute top-0 left-0 w-full h-full object-cover invert mix-blend-screen opacity-90"
                        autoPlay
                        loop
                        muted
                        src="https://cdn.pixabay.com/video/2021/09/26/89801-615423262_large.mp4"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </Modal>
        </div>
    );
};

export default Hero;
