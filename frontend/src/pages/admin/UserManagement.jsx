import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import { ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department_id: 1,
    manager_id: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
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
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await adminApi.createUser(formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        department_id: 1,
        manager_id: '',
      });
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department_id: user.department_id || 1,
      manager_id: user.manager_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deactivated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      render: (row) => (
        <Badge variant={
          row.role === 'ADMIN' ? 'danger' :
          row.role === 'MANAGER' ? 'primary' : 'default'
        }>
          {row.role}
        </Badge>
      ),
    },
    { header: 'Manager', accessor: 'manager_name', render: (row) => row.manager_name || '-' },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
            <Edit size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ADMIN', label: 'Admin' },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and roles</p>
          </div>
          <Button onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE', department_id: 1, manager_id: '' });
            setShowModal(true);
          }}>
            <Plus size={16} className="mr-1" />
            Add User
          </Button>
        </div>

        <Card>
          <Table columns={columns} data={users} />
        </Card>

        {/* User Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Add New User'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {!editingUser && (
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            )}

            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              required
            />
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement;