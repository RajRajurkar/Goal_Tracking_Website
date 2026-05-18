import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    entity_type: '',
    limit: 100,
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAuditLogs(filters);
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      header: 'User ID',
      accessor: 'user_id',
    },
    {
      header: 'Entity',
      accessor: 'entity_type',
    },
    {
      header: 'Entity ID',
      accessor: 'entity_id',
    },
    {
      header: 'Action',
      accessor: 'action',
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
    },
  ];

  const entityTypes = [
    { value: '', label: 'All' },
    { value: 'Goal', label: 'Goals' },
    { value: 'Approval', label: 'Approvals' },
    { value: 'Cycle', label: 'Cycles' },
    { value: 'User', label: 'Users' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Track all system changes</p>
        </div>

        <Card>
          <div className="flex gap-4 mb-6">
            <div className="w-48">
              <Select
                label="Entity Type"
                value={filters.entity_type}
                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
                options={entityTypes}
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table columns={columns} data={logs} />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AuditLogs;