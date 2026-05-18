import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { cycleApi } from '../../api/cycleApi';
import { checkinApi } from '../../api/checkinApi';
import { QUARTERS } from '../../utils/constants';
import toast from 'react-hot-toast';

const CheckIns = () => {
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuarter) {
      loadAchievements();
    }
  }, [selectedQuarter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);

      const quarterResponse = await cycleApi.getCurrentQuarter(cycleResponse.data.id);
      setCurrentQuarter(quarterResponse.data);
      setSelectedQuarter(quarterResponse.data?.quarter || 'Q1');
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    if (!activeCycle || !selectedQuarter) return;

    try {
      setLoading(true);
      const response = await checkinApi.getTeamAchievements(activeCycle.id, selectedQuarter);
      setAchievements(response.data || []);
    } catch (error) {
      toast.error('Failed to load team check-ins');
    } finally {
      setLoading(false);
    }
  };

  const quarterOptions = QUARTERS.map(q => ({
    value: q,
    label: q,
  }));

  const columns = [
    { header: 'Employee', accessor: 'employee_name' },
    { header: 'Goal', accessor: 'goal_title' },
    { header: 'Target', render: (row) => `${row.planned_target || row.target} ${row.uom_type || ''}` },
    { header: 'Achieved', render: (row) => `${row.actual_achievement || 0} ${row.uom_type || ''}` },
    { 
      header: 'Score', 
      render: (row) => (
        <span className={row.progress_score >= 100 ? 'text-success-600 font-medium' : 'text-gray-900'}>
          {row.progress_score || 0}%
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={
          row.status === 'APPROVED' ? 'success' :
          row.status === 'SUBMITTED' ? 'primary' :
          row.status === 'DRAFT' ? 'default' : 'warning'
        }>
          {row.status?.replace('_', ' ') || 'N/A'}
        </Badge>
      )
    }
  ];

  if (loading && !activeCycle) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Check-Ins</h1>
            <p className="text-gray-600 mt-1">Review quarterly progress for your team</p>
          </div>
          {currentQuarter && (
            <Badge variant="primary" size="lg">
              Current Quarter: {currentQuarter.quarter}
            </Badge>
          )}
        </div>

        <Card>
          <div className="max-w-xs mb-6">
            <Select
              label="Select Quarter"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              options={quarterOptions}
            />
          </div>

          {loading ? (
            <div className="py-12"><LoadingSpinner /></div>
          ) : (
            <Table columns={columns} data={achievements} />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default CheckIns;
