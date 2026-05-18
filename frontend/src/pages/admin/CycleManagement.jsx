import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { cycleApi } from '../../api/cycleApi';
import toast from 'react-hot-toast';
import { Plus, Edit, Check } from 'lucide-react';

const CycleManagement = () => {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    q1_start: '',
    q1_end: '',
    q2_start: '',
    q2_end: '',
    q3_start: '',
    q3_end: '',
    q4_start: '',
    q4_end: '',
  });

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const response = await cycleApi.getAllCycles();
      setCycles(response.data);
    } catch (error) {
      toast.error('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cycleApi.createCycle(formData);
      toast.success('Cycle created successfully');
      setShowModal(false);
      setFormData({
        name: '', start_date: '', end_date: '',
        q1_start: '', q1_end: '', q2_start: '', q2_end: '',
        q3_start: '', q3_end: '', q4_start: '', q4_end: '',
      });
      loadCycles();
    } catch (error) {
      toast.error(error.message || 'Failed to create cycle');
    }
  };

  const handleSetActive = async (cycleId) => {
    try {
      await cycleApi.setActiveCycle(cycleId);
      toast.success('Active cycle updated');
      loadCycles();
    } catch (error) {
      toast.error('Failed to update active cycle');
    }
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Cycle Management</h1>
            <p className="text-gray-600 mt-1">Manage goal cycles and check-in windows</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1" />
            Create Cycle
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {cycles.map((cycle) => (
            <Card key={cycle.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{cycle.name}</h3>
                    {cycle.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cycle Period</p>
                      <p className="font-medium">
                        {new Date(cycle.start_date).toLocaleDateString()} -{' '}
                        {new Date(cycle.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Q1</p>
                      <p className="font-medium">
                        {cycle.q1_start
                          ? `${new Date(cycle.q1_start).toLocaleDateString()} - ${new Date(cycle.q1_end).toLocaleDateString()}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Q2</p>
                      <p className="font-medium">
                        {cycle.q2_start
                          ? `${new Date(cycle.q2_start).toLocaleDateString()} - ${new Date(cycle.q2_end).toLocaleDateString()}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Q3</p>
                      <p className="font-medium">
                        {cycle.q3_start
                          ? `${new Date(cycle.q3_start).toLocaleDateString()} - ${new Date(cycle.q3_end).toLocaleDateString()}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!cycle.is_active && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleSetActive(cycle.id)}
                    >
                      <Check size={14} className="mr-1" />
                      Set Active
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create Cycle Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Cycle"
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create</Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Cycle Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., FY 2024-25"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <Input
                label="End Date"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <h4 className="font-medium text-gray-900">Check-in Windows</h4>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Q1 Start" type="date" name="q1_start" value={formData.q1_start} onChange={handleChange} />
              <Input label="Q1 End" type="date" name="q1_end" value={formData.q1_end} onChange={handleChange} />
              <Input label="Q2 Start" type="date" name="q2_start" value={formData.q2_start} onChange={handleChange} />
              <Input label="Q2 End" type="date" name="q2_end" value={formData.q2_end} onChange={handleChange} />
              <Input label="Q3 Start" type="date" name="q3_start" value={formData.q3_start} onChange={handleChange} />
              <Input label="Q3 End" type="date" name="q3_end" value={formData.q3_end} onChange={handleChange} />
              <Input label="Q4 Start" type="date" name="q4_start" value={formData.q4_start} onChange={handleChange} />
              <Input label="Q4 End" type="date" name="q4_end" value={formData.q4_end} onChange={handleChange} />
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CycleManagement;