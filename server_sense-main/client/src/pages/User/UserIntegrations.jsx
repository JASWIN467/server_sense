import React, { useState } from 'react';
import { Input, Button, Switch, Divider, message } from 'antd';
import { SendOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config/constants';

const UserIntegrations = () => {
    // Initialize state from localStorage so it persists across page reloads
    const [chatId, setChatId] = useState(localStorage.getItem('telegramChatId') || '');
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(localStorage.getItem('telegramConnected') === 'true');

    const handleConnect = async () => {
        if (!chatId) {
            message.error('Please enter a valid Telegram Chat ID');
            return;
        }
        setLoading(true);
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/integrations/telegram/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId })
            });
            const data = await res.json();
            
            if (res.ok) {
                setConnected(true);
                localStorage.setItem('telegramChatId', chatId);
                localStorage.setItem('telegramConnected', 'true');
                message.success('Connected! Check your Telegram for a test message.');
            } else {
                message.error(data.error || 'Failed to connect. Check backend logs.');
            }
        } catch (err) {
            console.error('Error connecting to Telegram integration:', err);
            message.error('Network error connecting to backend API');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = () => {
        setConnected(false);
        setChatId('');
        localStorage.removeItem('telegramChatId');
        localStorage.removeItem('telegramConnected');
        message.info('Telegram connection removed.');
    };

    return (
        <div className="space-y-6 text-gray-200 max-w-3xl">
            <div className="flex flex-col gap-1 px-1">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    Integrations & Webhooks
                </h1>
                <p className="text-sm text-gray-500">Connect third-party apps to receive real-time server health notifications.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        <SendOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Telegram Alert Bot</h2>
                        <p className="text-sm text-gray-400">Receive instant push notifications when your server experiences downtime or CPU spikes.</p>
                    </div>
                </div>

                <Divider className="border-white/5 my-6" />

                {!connected ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Telegram Chat ID</label>
                            <div className="flex gap-3">
                                <Input 
                                    size="large"
                                    placeholder="e.g. 123456789"
                                    value={chatId}
                                    onChange={(e) => setChatId(e.target.value)}
                                    className="bg-black/50 border-white/10 text-white placeholder-gray-600 focus:border-sky-500 hover:border-white/20"
                                />
                                <Button 
                                    type="primary" 
                                    size="large"
                                    loading={loading}
                                    onClick={handleConnect}
                                    className="bg-sky-500 hover:bg-sky-400 border-none px-8"
                                >
                                    Connect
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                <SafetyCertificateOutlined className="mr-1" /> End-to-end encrypted notification delivery.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-6 flex flex-col items-center text-center">
                        <CheckCircleOutlined className="text-4xl text-emerald-500 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">Telegram Connected!</h3>
                        <p className="text-sm text-emerald-400/80 mb-6">Alerts are being routed to Chat ID: {chatId}</p>
                        <Button 
                            danger 
                            ghost 
                            onClick={handleDisconnect}
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Disconnect Bot
                        </Button>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-xl opacity-50 grayscale">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold mb-1">Slack Integration</h3>
                        <p className="text-xs text-gray-500">Coming soon in v2.0</p>
                    </div>
                    <Button disabled className="bg-white/5 border-white/10 text-gray-500">Coming Soon</Button>
                </div>
            </div>
        </div>
    );
};

export default UserIntegrations;
