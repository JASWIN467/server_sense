import React from 'react';
import { GithubOutlined, TwitterOutlined, LinkedinOutlined, RocketOutlined } from '@ant-design/icons';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center text-2xl font-bold tracking-tighter text-white mb-6">
                            <RocketOutlined className="mr-2 text-primary" />
                            SERVER<span className="text-primary neon-text-blue">SENSE</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Next-generation server monitoring infrastructure.
                            Real-time insights for mission-critical applications.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><GithubOutlined className="text-xl" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><TwitterOutlined className="text-xl" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><LinkedinOutlined className="text-xl" /></a>
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} ServerSense Inc. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-500">
                        <span>Status: <span className="text-green-500 font-medium">All Systems Operational</span></span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
