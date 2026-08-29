import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Avatar, Space, Dropdown, message, Modal, Form, Select } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    MoreOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    KeyOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;

const GlassPanel = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xl ${className}`}>
        {children}
    </div>
);

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://serversense-server.onrender.com/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                message.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleInvite = () => {
        setModalMode('create');
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setModalMode('edit');
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleDelete = (user) => {
        confirm({
            title: 'Are you sure you want to delete this user?',
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: `This action cannot be undone. User ${user.username} will be permanently removed.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            className: 'glass-modal',
            onOk: async () => {
                try {
                    const response = await fetch(`https://serversense-server.onrender.com/api/users/${user._id}`, {
                        method: 'DELETE',
                    });
                    if (response.ok) {
                        message.success('User deleted successfully');
                        fetchUsers();
                    } else {
                        message.error('Failed to delete user');
                    }
                } catch (error) {
                    message.error('Error deleting user');
                }
            },
        });
    };

    const handleRoleChange = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            const response = await fetch(`https://serversense-server.onrender.com/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (response.ok) {
                message.success(`Role updated to ${newRole.toUpperCase()}`);
                fetchUsers();
            } else {
                message.error('Failed to update role');
            }
        } catch (error) {
            message.error('Error updating role');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const url = modalMode === 'create'
                ? 'https://serversense-server.onrender.com/api/auth/register'
                : `https://serversense-server.onrender.com/api/users/${editingUser._id}`;

            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                message.success(modalMode === 'create' ? 'User invited successfully' : 'User updated successfully');
                setIsModalOpen(false);
                fetchUsers();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            console.error(error);
            // Form validation error or network error
        }
    };

    // --- Columns ---

    const columns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        icon={<UserOutlined />}
                        className={`bg-gradient-to-br ${record.role === 'admin' ? 'from-sky-500 to-blue-600' : 'from-purple-500 to-pink-500'}`}
                    />
                    <div>
                        <div className="font-semibold text-gray-200">{text}</div>
                        <div className="text-xs text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag
                    icon={role === 'admin' ? <SafetyCertificateOutlined /> : <UserOutlined />}
                    className={`
                        border-none px-2 py-1 rounded-md flex w-fit items-center gap-1
                        ${role === 'admin'
                            ? 'bg-sky-500/10 text-sky-400'
                            : 'bg-purple-500/10 text-purple-400'}
                    `}
                >
                    {role ? role.toUpperCase() : 'USER'}
                </Tag>
            ),
        },
        {
            title: 'Password (Hashed)',
            dataIndex: 'password',
            key: 'password',
            render: (text) => (
                <div className="flex items-center gap-2 text-gray-500 text-xs font-mono truncate max-w-[150px]" title={text}>
                    <KeyOutlined />
                    {text ? `${text.substring(0, 10)}...` : 'Hidden'}
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: () => (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_emerald]" />
                    <span className="text-gray-300">Active</span>
                </div>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', label: 'Edit Profile', icon: <EditOutlined />, onClick: () => handleEdit(record) },
                            { key: 'promote', label: record.role === 'admin' ? 'Demote to User' : 'Promote to Admin', icon: <SafetyCertificateOutlined />, onClick: () => handleRoleChange(record) },
                            { type: 'divider' },
                            { key: 'deactivate', label: 'Delete User', danger: true, icon: <DeleteOutlined />, onClick: () => handleDelete(record) }
                        ]
                    }}
                    trigger={['click']}
                >
                    <Button type="text" icon={<MoreOutlined />} className="text-gray-400 hover:text-white" />
                </Dropdown>
            ),
        },
    ];

    const filteredUsers = users.filter(user =>
        (user.username && user.username.toLowerCase().includes(searchText.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                        <span className="text-secondary">|</span> User Oversight
                    </h2>
                    <p className="text-sm text-gray-500">Manage access and user roles.</p>
                </div>
                <div className="flex gap-3">
                    <Input
                        placeholder="Search users..."
                        prefix={<SearchOutlined className="text-gray-500" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full sm:w-64 border-white/10 bg-[#0a0a0a] text-gray-200 placeholder:text-gray-600 hover:border-white/20 focus:border-secondary/50"
                    />
                    <Button
                        type="primary"
                        icon={<TeamOutlined />}
                        onClick={handleInvite}
                        className="bg-secondary border-none hover:bg-secondary/80 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                    >
                        Invite User
                    </Button>
                </div>
            </div>

            {/* Table */}
            <GlassPanel>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    className="custom-table"
                />
            </GlassPanel>

            {/* Modal */}
            <Modal
                title={modalMode === 'create' ? "Invite New User" : "Edit User Profile"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                okText={modalMode === 'create' ? "Create User" : "Save Changes"}
                cancelText="Cancel"
                className="glass-modal"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="userForm"
                    initialValues={{ role: 'user' }}
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please input the username!' }]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role!' }]}
                    >
                        <Select>
                            <Option value="user">User</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={modalMode === 'create' ? "Password" : "New Password (Optional)"}
                        rules={[{ required: modalMode === 'create', message: 'Please input the password!' }]}
                    >
                        <Input.Password placeholder={modalMode === 'create' ? "Enter password" : "Leave blank to keep current"} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserList;
