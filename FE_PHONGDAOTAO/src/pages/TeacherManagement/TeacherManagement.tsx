import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Card,
  Typography,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import teacherApi, { Teacher } from '../../services/apiUser/TeacherAPI';

const { Title, Paragraph } = Typography;

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await teacherApi.getAll();
      setTeachers(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch teachers:', error);
      messageApi.error('Không thể tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      form.setFieldsValue(teacher);
    } else {
      setEditingTeacher(null);
      form.resetFields();
    }
    setOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingTeacher && editingTeacher.id) {
        await teacherApi.updateTeacher(editingTeacher.id, {
          name: values.name,
          email: values.email,
          teacherCode: values.teacherCode,
        });
        messageApi.success(`Cập nhật giảng viên ${values.name} thành công`);
      } else {
        await teacherApi.createTeacher({
          name: values.name,
          email: values.email,
          teacherCode: values.teacherCode,
        });
        messageApi.success(`Thêm giảng viên ${values.name} thành công`);
      }
      handleCancel();
      fetchData();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      messageApi.error(`Thao tác thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (record: Teacher) => {
    if (!record.id) return;
    setLoading(true);
    try {
      await teacherApi.deleteTeacher(record.id);
      messageApi.success(`Xóa giảng viên ${record.name} thành công`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      messageApi.error(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (teacher.teacherCode && teacher.teacherCode.toLowerCase().includes(searchText.toLowerCase())),
  );

  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (id: number) => <Tag color="purple" style={{ fontSize: '12px', padding: '2px 6px' }}>GV-{id}</Tag>,
    },
    {
      title: 'Mã giảng viên',
      dataIndex: 'teacherCode',
      key: 'teacherCode',
      width: '18%',
      sorter: (a: any, b: any) => (a.teacherCode || '').localeCompare(b.teacherCode || ''),
      render: (teacherCode: string) => (
        <span style={{ fontWeight: 600, color: '#34495e' }}>
          <IdcardOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          {teacherCode}
        </span>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: '27%',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <span style={{ fontWeight: 500, color: '#2c3e50' }}>
          <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Email giảng viên',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      render: (email: string) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          {email}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Teacher) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EditOutlined style={{ color: '#722ed1' }} />}
              style={{ borderColor: '#722ed1' }}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa giảng viên?"
            description="Tất cả môn học được phân công cho giảng viên này sẽ cần phân công lại."
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa giảng viên">
              <Button type="primary" danger ghost shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {contextHolder}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}>
              Quản Lý Giảng Viên
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Danh sách giảng viên tham gia giảng dạy và phân công công việc.
            </Paragraph>
          </div>
          <Button
            type="primary"
            shape="round"
            size="large"
            icon={<PlusCircleFilled />}
            onClick={() => showModal()}
            style={{
              background: 'linear-gradient(90deg, #722ed1 0%, #531dab 100%)',
              border: 'none',
              boxShadow: '0 4px 10px rgba(114,46,209,0.3)',
              fontWeight: 600,
            }}
          >
            THÊM GIẢNG VIÊN
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm theo mã số, tên hoặc email..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            size="large"
            style={{ width: 320, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
            style={{ borderRadius: 8 }}
          >
            Làm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTeachers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          style={{ overflowX: 'auto' }}
          bordered
        />
      </Card>

      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0C2B4E', textAlign: 'center', paddingBottom: 10 }}>
            {editingTeacher ? 'CẬP NHẬT GIẢNG VIÊN' : 'THÊM GIẢNG VIÊN MỚI'}
          </div>
        }
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} style={{ borderRadius: 6 }}>
            Hủy bỏ
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(90deg, #722ed1 0%, #531dab 100%)',
              border: 'none',
              fontWeight: 600,
              padding: '0 24px',
            }}
          >
            Lưu thông tin
          </Button>,
        ]}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Mã giảng viên</span>}
            name="teacherCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã giảng viên!' },
              { min: 2, message: 'Mã giảng viên phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập mã giảng viên" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên giảng viên!' },
              { min: 2, message: 'Tên phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập tên giảng viên" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Địa chỉ Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Định dạng email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="example@teacher.com" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
