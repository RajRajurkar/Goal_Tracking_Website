import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { Play, CheckCircle } from 'lucide-react';

const Escalations = () => {
  const [loading, setLoading] = useState(true);
  const [escalations, setEscalations] = useState([]);

  useEffect(() => {
    loadEscalations();
  }, []);

  const loadEscalations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEscalations();
      setEscalations(response.data);
    } catch (error) {
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminApi.resolveEscalation(id, 'Resolved manually');
      toast.success('Escalation resolved');
      loadEscalations();
    } catch (error) {
      toast.error('Failed to resolve');
    }
  };

  const handleTriggerCheck = async (type) => {
    try {
      const response = await adminApi.triggerEscalation(type);
      toast.success(`${response.data.count} escalations triggered`);
      loadEscalations();
    } catch (error) {
      toast.error('Failed to trigger escalation check');
    }
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'rule_type',
      render: (row) => (
        <Badge variant="danger">{row.rule_type.replace('_', ' ')}</Badge>
      ),
    },
    { header: 'User', accessor: 'user_name' },
    { header: 'Email', accessor: 'user_email' },
    {
      header: 'Sent At',
      accessor: 'sent_at',
      render: (row) => new Date(row.sent_at).toLocaleString(),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.resolved_at ? 'success' : 'warning'}>
          {row.resolved_at ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        !row.resolved_at && (
          <Button size="sm" variant="success" onClick={() => handleResolve(row.id)}>
            <CheckCircle size={14} className="mr-1" />
            Resolve
          </Button>
        )
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escalations</h1>
            <p className="text-gray-600 mt-1">Manage system escalations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleTriggerCheck('NO_SUBMISSION')}>
              <Play size={14} className="mr-1" />
              Check Submissions
            </Button>
            <Button variant="outline" onClick={() => handleTriggerCheck('NO_APPROVAL')}>
              <Play size={14} className="mr-1" />
              Check Approvals
            </Button>
          </div>
        </div>

        <Card>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table columns={columns} data={escalations} />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Escalations;