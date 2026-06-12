import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    DashboardOutlined,
    CloudServerOutlined,
    AlertOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;

const UserLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            key: '/user/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/user/dashboard">Overview</Link>,
        },
        {
            key: '/user/servers',
            icon: <CloudServerOutlined />,
            label: <Link to="/user/servers">My Servers</Link>,
        },
        {
            key: '/user/alerts',
            icon: <AlertOutlined />,
            label: <Link to="/user/alerts">System Alerts</Link>,
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
            },
        ],
        onClick: handleMenuClick
    };

    return (
        <Layout className="min-h-screen font-sans">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                className="border-r border-gray-800"
                style={{ background: '#050505' }}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <span className={`text-xl font-bold tracking-tighter text-white transition-opacity duration-300 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        SERVER<span className="text-secondary drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">SENSE</span>
                    </span>
                    {collapsed && <span className="text-xl font-bold text-secondary">S</span>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="bg-transparent border-r-0 mt-4 px-2 [&_.ant-menu-item-selected]:bg-secondary/10 [&_.ant-menu-item-selected]:text-secondary"
                    style={{ background: 'transparent' }}
                />

                {/* User Role Badge */}
                {!collapsed && (
                    <div className="absolute bottom-8 left-0 w-full px-6">
                        <div className="rounded-lg bg-secondary/5 border border-secondary/20 p-4">
                            <h4 className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Current Role</h4>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                View-only access to server metrics & alerts.
                            </p>
                        </div>
                    </div>
                )}
            </Sider>
            <Layout className="bg-background">
                <Header className="bg-background/80 backdrop-blur-md border-b border-gray-800 px-6 flex justify-between items-center h-16 sticky top-0 z-20">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white hover:text-secondary text-lg w-10 h-10"
                    />

                    <div className="flex items-center gap-6">
                        <Link to="/user/alerts">
                            <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer relative">
                                <BellOutlined className="text-xl text-gray-400 hover:text-white transition-colors" />
                            </motion.div>
                        </Link>

                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">
                                <Avatar
                                    icon={<UserOutlined />}
                                    className="bg-secondary/20 text-secondary border border-secondary/40"
                                />
                                <div className="hidden md:flex items-center">
                                    <span className="text-base font-bold text-white tracking-wide">User</span>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="p-6 overflow-y-auto bg-background">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserLayout;
