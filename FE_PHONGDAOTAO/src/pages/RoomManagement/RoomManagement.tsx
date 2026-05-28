import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
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
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import roomApi, { Room } from '../../services/apiUser/RoomAPI';

const { Title, Paragraph } = Typography;

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await roomApi.getAll();
      setRooms(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
      messageApi.error('Không thể tải danh sách phòng học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue(room);
    } else {
      setEditingRoom(null);
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
      if (editingRoom && editingRoom.id) {
        await roomApi.updateRoom(editingRoom.id, {
          name: values.name,
          capacity: values.capacity,
        });
        messageApi.success(`Cập nhật phòng học ${values.name} thành công`);
      } else {
        await roomApi.createRoom({
          name: values.name,
          capacity: values.capacity,
        });
        messageApi.success(`Thêm phòng học ${values.name} thành công`);
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

  const onDelete = async (record: Room) => {
    if (!record.id) return;
    setLoading(true);
    try {
      await roomApi.deleteRoom(record.id);
      messageApi.success(`Xóa phòng học ${record.name} thành công`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      messageApi.error(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (id: number) => <Tag color="orange" style={{ fontSize: '13px', padding: '3px 8px' }}>R-{id}</Tag>,
    },
    {
      title: 'Tên phòng học',
      dataIndex: 'name',
      key: 'name',
      width: '45%',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#2c3e50' }}>
          <HomeOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Sức chứa (Capacity)',
      dataIndex: 'capacity',
      key: 'capacity',
      width: '25%',
      sorter: (a: any, b: any) => a.capacity - b.capacity,
      render: (capacity: number) => (
        <span style={{ fontWeight: 500 }}>
          <TeamOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          {capacity} chỗ ngồi
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Room) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EditOutlined style={{ color: '#fa8c16' }} />}
              style={{ borderColor: '#fa8c16' }}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa phòng học?"
            description="Hãy đảm bảo không có lịch học nào đang dùng phòng này."
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa phòng học">
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
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}>
              Quản Lý Phòng Học
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Danh sách phòng lý thuyết, thực hành và số lượng máy/chỗ ngồi tối đa.
            </Paragraph>
          </div>
          <Button
            type="primary"
            shape="round"
            size="large"
            icon={<PlusCircleFilled />}
            onClick={() => showModal()}
            style={{
              background: 'linear-gradient(90deg, #fa8c16 0%, #d46b08 100%)',
              border: 'none',
              boxShadow: '0 4px 10px rgba(250,140,22,0.3)',
              fontWeight: 600,
            }}
          >
            THÊM PHÒNG HỌC
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm theo tên phòng học..."
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
          dataSource={filteredRooms}
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
            {editingRoom ? 'CẬP NHẬT PHÒNG HỌC' : 'THÊM PHÒNG HỌC MỚI'}
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
              background: 'linear-gradient(90deg, #fa8c16 0%, #d46b08 100%)',
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
            label={<span style={{ fontWeight: 600 }}>Tên phòng học</span>}
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng!' },
              { min: 2, message: 'Tên phòng phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />} placeholder="Ví dụ: C708, C701" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Sức chứa (Capacity)</span>}
            name="capacity"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa!' },
            ]}
          >
            <InputNumber
              prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />}
              min={1}
              max={1000}
              placeholder="Chỗ ngồi"
              size="large"
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
