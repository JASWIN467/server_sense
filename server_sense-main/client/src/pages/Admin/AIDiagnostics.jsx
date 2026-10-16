import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Spin, Progress, Modal, message, Popconfirm, Space, Divider, Tabs, Statistic, Row, Col, Table } from 'antd';
import {
  RobotOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  DesktopOutlined,
  HistoryOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS } from '../../config/constants';

const getRiskTag = (risk) => {
  switch (risk?.toLowerCase()) {
    case 'high':
      return <Tag color="red" className="font-semibold px-2 py-0.5">HIGH RISK</Tag>;
    case 'medium':
      return <Tag color="orange" className="font-semibold px-2 py-0.5">MEDIUM RISK</Tag>;
    case 'low':
    default:
      return <Tag color="green" className="font-semibold px-2 py-0.5">LOW RISK</Tag>;
  }
};

const getActionBadge = (action) => {
  switch (action) {
    case 'restart_container':
      return <Tag color="blue" icon={<DesktopOutlined />}>Restart Container</Tag>;
    case 'clear_temp_files':
      return <Tag color="cyan" icon={<FolderOpenOutlined />}>Clear Temp Files</Tag>;
    case 'rotate_logs':
      return <Tag color="purple" icon={<FolderOpenOutlined />}>Rotate Logs</Tag>;
    case 'no_action_needed':
      return <Tag color="default">No Action Needed</Tag>;
    case 'manual_investigation_required':
    default:
      return <Tag color="gold" icon={<WarningOutlined />}>Manual Investigation</Tag>;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'executed':
      return <Tag color="success" icon={<CheckOutlined />}>Executed</Tag>;
    case 'execution_failed':
      return <Tag color="error" icon={<CloseOutlined />}>Execution Failed</Tag>;
    case 'rejected':
      return <Tag color="default">Rejected</Tag>;
    case 'ai_failed':
      return <Tag color="warning">AI Failed</Tag>;
    default:
      return <Tag color="processing">{status}</Tag>;
  }
};

const DiagnosisCard = ({ diag, handleApprove, handleReject, handleMarkOutcome, actionLoading, setSelectedSnapshot }) => {
  let actionContent = null;

  if (diag.status === 'pending_approval') {
    actionContent = (
      <div className="space-y-2 mt-6">
        <Popconfirm
          title="Approve & Execute Action?"
          description="This will execute the real system command on your host server."
          onConfirm={() => handleApprove(diag._id)}
          okText="Yes, Approve"
          cancelText="Cancel"
          okButtonProps={{ loading: actionLoading === diag._id, className: 'bg-green-600 hover:bg-green-500', 'data-testid': `approve-confirm-btn-${diag._id}` }}
        >
          <Button
            type="primary"
            block
            icon={<CheckOutlined />}
            loading={actionLoading === diag._id}
            className="bg-green-600 hover:bg-green-500 font-semibold h-10"
            data-testid={`approve-btn-${diag._id}`}
          >
            Approve Action
          </Button>
        </Popconfirm>

        <Popconfirm
          title="Reject Diagnosis?"
          description="This diagnosis will be marked as rejected without executing any system action."
          onConfirm={() => handleReject(diag._id)}
          okText="Yes, Reject"
          cancelText="Cancel"
          okButtonProps={{ danger: true, 'data-testid': `reject-confirm-btn-${diag._id}` }}
        >
          <Button
            danger
            block
            icon={<CloseOutlined />}
            loading={actionLoading === diag._id}
            className="h-10"
            data-testid={`reject-btn-${diag._id}`}
          >
            Reject
          </Button>
        </Popconfirm>
      </div>
    );
  } else if (diag.status === 'executed') {
    if (diag.outcomeCorrect === null || diag.outcomeCorrect === undefined) {
      actionContent = (
        <div className="space-y-2 mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <span className="text-xs font-bold text-gray-300 block text-center mb-2">Did this fix actually resolve the problem?</span>
          <div className="flex gap-2">
            <Popconfirm
              title="Confirm Yes?"
              onConfirm={() => handleMarkOutcome(diag._id, true)}
              okText="Confirm"
              cancelText="Cancel"
              okButtonProps={{ 'data-testid': `outcome-yes-confirm-btn-${diag._id}` }}
            >
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-500 flex-1"
                loading={actionLoading === diag._id}
                data-testid={`outcome-yes-btn-${diag._id}`}
              >
                Yes, correct
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Confirm No?"
              onConfirm={() => handleMarkOutcome(diag._id, false)}
              okText="Confirm"
              cancelText="Cancel"
              okButtonProps={{ danger: true, 'data-testid': `outcome-no-confirm-btn-${diag._id}` }}
            >
              <Button
                danger
                className="flex-1"
                loading={actionLoading === diag._id}
                data-testid={`outcome-no-btn-${diag._id}`}
              >
                No, wrong
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    } else if (diag.outcomeCorrect === true) {
      actionContent = <div className="mt-6 flex justify-center"><Tag color="success" className="w-full text-center py-1" data-testid={`outcome-correct-tag-${diag._id}`}>Confirmed Correct</Tag></div>;
    } else {
      actionContent = <div className="mt-6 flex justify-center"><Tag color="error" className="w-full text-center py-1" data-testid={`outcome-incorrect-tag-${diag._id}`}>Confirmed Incorrect</Tag></div>;
    }
  } else {
    actionContent = <div className="mt-6 flex justify-center w-full">{getStatusBadge(diag.status)}</div>;
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800 hover:border-primary/40 transition-all shadow-lg mb-4">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Left Column: Diagnosis Info */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Tag color="cyan" className="font-semibold uppercase">
              {diag.alertId?.metric || 'SYSTEM'} ALERT
            </Tag>
            <Tag color={diag.alertId?.severity === 'critical' ? 'red' : 'orange'}>
              {diag.alertId?.severity?.toUpperCase() || 'WARNING'}
            </Tag>
            {getRiskTag(diag.riskLevel)}
            <span className="text-xs text-gray-500">
              Generated: {new Date(diag.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
              Problem Summary
            </span>
            <p className="text-gray-100 font-medium text-base mt-1">
              {diag.problemSummary}
            </p>
          </div>

          <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">
              Likely Cause Analysis
            </span>
            <p className="text-gray-300 text-sm mt-1">
              {diag.likelyCause}
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-primary">
                Recommended Action
              </span>
              {getActionBadge(diag.recommendedAction)}
            </div>
            <p className="text-gray-200 text-sm font-medium">
              {diag.actionExplanation}
            </p>
            {diag.targetContainer && (
              <div className="mt-2 text-xs font-mono text-gray-400">
                Target Container: <span className="text-primary font-bold">{diag.targetContainer}</span>
              </div>
            )}
            {diag.targetPath && (
              <div className="mt-2 text-xs font-mono text-gray-400">
                Target Directory/File Path: <span className="text-cyan-400 font-bold">{diag.targetPath}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Confidence Bar & Action Buttons */}
        <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-800 lg:pl-6 pt-4 lg:pt-0">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400 block mb-2">
              AI Confidence Score
            </span>
            <Progress
              percent={Math.round((diag.confidence || 0) * 100)}
              status={diag.confidence >= 0.8 ? 'success' : diag.confidence >= 0.5 ? 'active' : 'exception'}
              strokeColor={diag.confidence >= 0.8 ? '#52c41a' : diag.confidence >= 0.5 ? '#faad14' : '#ff4d4f'}
            />
            <span className="text-xs text-gray-500 block mt-1">
              Model: Google Gemini
            </span>
          </div>

          <div>
            {actionContent}
            <Button
              type="link"
              block
              size="small"
              icon={<CodeOutlined />}
              onClick={() => setSelectedSnapshot(diag.evidenceSnapshot)}
              className="text-gray-400 hover:text-white mt-4"
            >
              View Raw Evidence
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AIDiagnostics = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [accuracyStats, setAccuracyStats] = useState(null);
  const [accuracyError, setAccuracyError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSES.LIST);
      if (response.ok) {
        const data = await response.json();
        setDiagnoses(data);
      } else {
        message.error('Failed to fetch AI diagnoses');
      }
    } catch (err) {
      console.error('Error fetching diagnoses:', err);
      message.error('Network error fetching diagnoses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccuracy = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSES.ACCURACY);
      if (response.ok) {
        const data = await response.json();
        setAccuracyStats(data);
        setAccuracyError(null);
      } else {
        setAccuracyError('Failed to fetch accuracy stats');
      }
    } catch (err) {
      console.error('Error fetching accuracy:', err);
      setAccuracyError('Network error fetching accuracy');
    }
  };

  useEffect(() => {
    fetchDiagnoses();
    fetchAccuracy();
    const interval = setInterval(() => {
      fetchDiagnoses();
      fetchAccuracy();
    }, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSES.APPROVE(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Admin User' }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'executed') {
          message.success(`Action successfully executed: ${data.recommendedAction}`);
        } else if (data.status === 'execution_failed') {
          message.error(`Execution failed: ${data.errorMessage}`);
        }
        fetchDiagnoses();
        fetchAccuracy();
      } else {
        message.error(data.message || 'Failed to approve diagnosis');
      }
    } catch (err) {
      message.error('Error approving diagnosis');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSES.REJECT(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Admin User' }),
      });

      if (response.ok) {
        message.info('Diagnosis rejected');
        fetchDiagnoses();
        fetchAccuracy();
      } else {
        const data = await response.json();
        message.error(data.message || 'Failed to reject diagnosis');
      }
    } catch (err) {
      message.error('Error rejecting diagnosis');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkOutcome = async (id, outcomeCorrect) => {
    setActionLoading(id);
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSES.OUTCOME(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeCorrect }),
      });

      if (response.ok) {
        message.success('Outcome recorded successfully');
        fetchDiagnoses();
        fetchAccuracy();
      } else {
        const data = await response.json();
        message.error(data.message || 'Failed to mark outcome');
      }
    } catch (err) {
      message.error('Error marking outcome');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingDiagnoses = diagnoses.filter(d => d.status === 'pending_approval');
  const historyDiagnoses = diagnoses.filter(d => d.status !== 'pending_approval');
  const outcomeDiagnoses = diagnoses.filter(d => d.status === 'executed')
    .sort((a, b) => {
      if (a.outcomeCorrect === null && b.outcomeCorrect !== null) return -1;
      if (a.outcomeCorrect !== null && b.outcomeCorrect === null) return 1;
      return 0;
    });

  const renderCardList = (list, emptyMessage) => {
    if (loading && list.length === 0) {
      return (
        <Card className="bg-gray-900 border-gray-800 text-center py-8">
          <Spin size="large" />
          <p className="text-gray-400 mt-3">Loading AI diagnoses...</p>
        </Card>
      );
    }

    if (list.length === 0) {
      return (
        <Card className="bg-gray-900 border-gray-800 text-center py-8">
          <InfoCircleOutlined className="text-3xl text-gray-500 mb-2" />
          <p className="text-gray-400">{emptyMessage}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((diag) => (
          <DiagnosisCard
            key={diag._id}
            diag={diag}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleMarkOutcome={handleMarkOutcome}
            actionLoading={actionLoading}
            setSelectedSnapshot={setSelectedSnapshot}
          />
        ))}
      </div>
    );
  };

  const historyColumns = [
    {
      title: 'Time',
      key: 'createdAt',
      render: (_, r) => <span className="text-xs font-mono text-gray-400">{new Date(r.createdAt || Date.now()).toLocaleString()}</span>
    },
    {
      title: 'Target Metric',
      key: 'metric',
      render: (_, r) => (
        <Space>
          <Tag color="cyan" className="font-mono uppercase text-xs">{r.alertId?.metric || 'SYSTEM'}</Tag>
          <Tag color={r.alertId?.severity === 'critical' ? 'red' : 'orange'} className="uppercase text-[10px]">{r.alertId?.severity || 'WARNING'}</Tag>
        </Space>
      )
    },
    {
      title: 'Problem Summary',
      dataIndex: 'problemSummary',
      key: 'problemSummary',
      render: (text) => <span className="text-gray-200 text-sm font-medium">{text}</span>
    },
    {
      title: 'Action / Target',
      key: 'action',
      render: (_, r) => (
        <div className="space-y-1">
          {getActionBadge(r.recommendedAction)}
          {(r.targetContainer || r.targetPath) && (
            <div className="text-[11px] font-mono text-gray-400">
              {r.targetContainer || r.targetPath}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => getStatusBadge(r.status)
    },
    {
      title: 'Reviewed By',
      dataIndex: 'reviewedBy',
      key: 'reviewedBy',
      render: (text) => <span className="text-xs text-gray-400">{text || 'Admin User'}</span>
    }
  ];

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2" data-testid="tab-pending-review">
          <SafetyCertificateOutlined />
          Pending Review ({pendingDiagnoses.length})
        </span>
      ),
      children: renderCardList(pendingDiagnoses, 'No pending diagnoses requiring approval at this time.')
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2" data-testid="tab-audit-history">
          <HistoryOutlined />
          Audit History ({historyDiagnoses.length})
        </span>
      ),
      children: historyDiagnoses.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800 text-center py-8">
          <InfoCircleOutlined className="text-3xl text-gray-500 mb-2" />
          <p className="text-gray-400">No diagnosis history available.</p>
        </Card>
      ) : (
        <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
          <Table
            dataSource={historyDiagnoses}
            columns={historyColumns}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
            className="custom-dark-table text-sm"
          />
        </Card>
      )
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2" data-testid="tab-accuracy">
          <BarChartOutlined />
          Accuracy & Verification ({outcomeDiagnoses.length})
        </span>
      ),
      children: (
        <div className="space-y-6">
          {accuracyError && <div className="text-red-400 mb-4">{accuracyError}</div>}
          {!accuracyError && accuracyStats && (
            <Card className="bg-gray-900 border-gray-800 shadow-xl" data-testid="accuracy-summary">
              {accuracyStats.totalReviewed === 0 ? (
                <div className="text-center text-gray-400 py-4" data-testid="no-reviews-yet">No executed diagnoses verified yet</div>
              ) : (
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title={<span className="text-gray-400 font-medium">Model Accuracy %</span>} value={accuracyStats.accuracyPercent} suffix="%" valueStyle={{ color: '#10b981', fontWeight: 'bold' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title={<span className="text-gray-400 font-medium">Fixes Verified Correct</span>} value={accuracyStats.correctCount} valueStyle={{ color: '#52c41a' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title={<span className="text-gray-400 font-medium">Fixes Verified Incorrect</span>} value={(accuracyStats.totalReviewed || 0) - (accuracyStats.correctCount || 0)} valueStyle={{ color: '#ff4d4f' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title={<span className="text-gray-400 font-medium font-mono">Total Verified Fixes</span>} value={accuracyStats.totalReviewed} valueStyle={{ color: '#1890ff' }} />
                  </Col>
                </Row>
              )}
            </Card>
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
              <CheckOutlined className="text-emerald-400" /> Executed Actions Verification Cards
            </h3>
            {renderCardList(outcomeDiagnoses, 'No executed diagnoses available to verify.')}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/60 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <RobotOutlined className="text-primary text-3xl" />
            AI Diagnostics & Remediation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-assisted root cause analysis and targeted remediation — requires explicit human approval
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => { fetchDiagnoses(); fetchAccuracy(); }}
          loading={loading}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
        >
          Refresh
        </Button>
      </div>

      <Tabs 
        defaultActiveKey="1" 
        items={items} 
        className="text-white custom-tabs"
      />

      {/* Raw Evidence Modal */}
      <Modal
        title="Gathered Evidence Snapshot"
        open={!!selectedSnapshot}
        onCancel={() => setSelectedSnapshot(null)}
        footer={null}
        width={700}
        className="dark-modal"
      >
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
          {JSON.stringify(selectedSnapshot, null, 2)}
        </pre>
      </Modal>

      <style>{`
        .custom-tabs .ant-tabs-nav-wrap {
          margin-bottom: 16px;
        }
        .custom-tabs .ant-tabs-tab {
          color: #9ca3af;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #10b981 !important;
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: #10b981;
        }
      `}</style>
    </div>
  );
};

export default AIDiagnostics;
