import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { cycleApi } from '../../api/cycleApi';
import { reportApi } from '../../api/reportApi';
import { QUARTERS } from '../../utils/constants';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    loadCycleData();
  }, []);

  useEffect(() => {
    if (activeCycle) {
      loadReportData();
    }
  }, [activeCycle, selectedQuarter]);

  const loadCycleData = async () => {
    try {
      setLoading(true);
      const cycleResponse = await cycleApi.getActiveCycle();
      setActiveCycle(cycleResponse.data);
    } catch (error) {
      toast.error('Failed to load active cycle');
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = { cycle_id: activeCycle.id };
      if (selectedQuarter) {
        params.quarter = selectedQuarter;
      }
      const response = await reportApi.getAchievementReport(params);
      setReportData(response.data || []);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    if (!activeCycle) return;
    
    const params = { cycle_id: activeCycle.id };
    if (selectedQuarter) {
      params.quarter = selectedQuarter;
    }

    try {
      if (type === 'csv') setDownloadingCsv(true);
      if (type === 'excel') setDownloadingExcel(true);

      const response = type === 'csv' 
        ? await reportApi.exportCSV(params) 
        : await reportApi.exportExcel(params);
        
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `achievement_report_${type.toUpperCase()}_${Date.now()}.${type === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`Downloaded ${type.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to download ${type.toUpperCase()}`);
    } finally {
      setDownloadingCsv(false);
      setDownloadingExcel(false);
    }
  };

  const quarterOptions = [
    { value: '', label: 'All Quarters' },
    ...QUARTERS.map(q => ({ value: q, label: q }))
  ];

  const columns = [
    { header: 'Employee', accessor: 'employee_name' },
    { header: 'Department', accessor: 'department_name' },
    { header: 'Goal', accessor: 'goal_title' },
    { header: 'Target', render: (row) => `${row.target} ${row.uom_type || ''}` },
    { header: 'Quarter', accessor: 'quarter' },
    { header: 'Achieved', render: (row) => row.actual_achievement !== null ? `${row.actual_achievement} ${row.uom_type || ''}` : 'N/A' },
    { 
      header: 'Score', 
      render: (row) => (
        <span className={row.progress_score >= 100 ? 'text-success-600 font-medium' : 'text-gray-900'}>
          {row.progress_score !== null ? `${row.progress_score}%` : 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        row.status ? (
          <Badge variant={
            row.status === 'APPROVED' ? 'success' :
            row.status === 'SUBMITTED' ? 'primary' :
            row.status === 'DRAFT' ? 'default' : 'warning'
          }>
            {row.status.replace('_', ' ')}
          </Badge>
        ) : <span className="text-gray-400">-</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Achievement Reports</h1>
            <p className="text-gray-600 mt-1">Export and analyze performance data across the organization</p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleDownload('csv')}
              loading={downloadingCsv}
              disabled={reportData.length === 0}
              className="flex items-center"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleDownload('excel')}
              loading={downloadingExcel}
              disabled={reportData.length === 0}
              className="flex items-center"
            >
              <Download size={16} className="mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <Card>
          <div className="max-w-xs mb-6">
            <Select
              label="Filter by Quarter"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              options={quarterOptions}
            />
          </div>

          {loading ? (
            <div className="py-12"><LoadingSpinner /></div>
          ) : (
            <Table columns={columns} data={reportData} />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
