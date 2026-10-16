import React, { useState, useEffect } from 'react';
import { Table, Switch, Button, Modal, Form, Select, InputNumber, Input, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../../config/constants';

const AutomationRules = () => {
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchRules = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.RULES.LIST, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setRules(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.RULES.LOGS, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setLogs(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchRules();
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleRule = async (id, currentEnabled) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(API_ENDPOINTS.RULES.UPDATE(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ enabled: !currentEnabled })
            });
            fetchRules();
        } catch (err) { message.error('Failed to toggle rule'); }
    };

    const deleteRule = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(API_ENDPOINTS.RULES.DELETE(id), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchRules();
            message.success('Rule deleted');
        } catch (err) { message.error('Failed to delete rule'); }
    };

    const onFinish = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(API_ENDPOINTS.RULES.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...values, enabled: false })
            });
            setIsModalOpen(false);
            form.resetFields();
            fetchRules();
            message.success('Rule created. It is disabled by default.');
        } catch (err) { message.error('Failed to create rule'); }
    };

    const ruleColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Condition', key: 'condition', render: (_, r) => (`${r.metric ? r.metric.toUpperCase() : 'METRIC'} is ${r.severity || 'warning'} for ${r.sustainedMinutes || 2}m`) },
        { title: 'Action', key: 'action', render: (_, r) => <Tag color="blue">{r.action || 'restart_container'} : {r.targetContainer}</Tag> },
        { title: 'Enabled', key: 'enabled', render: (_, r) => <Switch checked={!!r.enabled} onChange={() => toggleRule(r._id, r.enabled)} /> },
        { title: '', key: 'delete', render: (_, r) => (
            <Popconfirm title="Delete this rule?" onConfirm={() => deleteRule(r._id)}>
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        ) }
    ];

    const logColumns = [
        { title: 'Time', dataIndex: 'executedAt', render: (t) => new Date(t).toLocaleString() },
        { title: 'Rule Name', dataIndex: 'ruleName' },
        { title: 'Target', dataIndex: 'targetContainer' },
        { title: 'Status', key: 'status', render: (_, l) => (
            l.success ? <Tag color="success">Success</Tag> : <Tag color="error" title={l.errorMessage}>Failed</Tag>
        ) }
    ];

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Create Rule</Button>
                </div>
                <Table dataSource={rules} columns={ruleColumns} rowKey="_id" pagination={false} className="custom-dark-table" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CodeOutlined /> Remediation History</h3>
                <Table dataSource={logs} columns={logColumns} rowKey="_id" pagination={{ pageSize: 5 }} className="custom-dark-table" size="small" />
            </div>

            <Modal title="Create Remediation Rule" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}><Input placeholder="e.g. Restart on Critical RAM" /></Form.Item>
                    <Form.Item name="metric" label="Metric" rules={[{ required: true }]}><Select options={[{value:'cpu', label:'CPU'},{value:'memory', label:'Memory'},{value:'disk', label:'Disk'}]} /></Form.Item>
                    <Form.Item name="severity" label="Severity Trigger" rules={[{ required: true }]}><Select options={[{value:'warning', label:'Warning'},{value:'critical', label:'Critical'}]} /></Form.Item>
                    <Form.Item name="sustainedMinutes" label="Sustained Minutes" rules={[{ required: true }]} extra="Minimum 2 minutes"><InputNumber min={2} className="w-full" /></Form.Item>
                    <Form.Item name="action" label="Action" initialValue="restart_container"><Select options={[{value:'restart_container', label:'Restart Docker Container'}]} disabled /></Form.Item>
                    <Form.Item name="targetContainer" label="Target Container Name" rules={[{ required: true }]}><Input placeholder="e.g. serversense-server" /></Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full mt-4">Create Disabled Rule</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AutomationRules;
