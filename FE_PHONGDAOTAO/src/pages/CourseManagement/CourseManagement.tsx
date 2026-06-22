import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Card,
  Typography,
  Tooltip,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import courseApi, { Course } from '../../services/apiUser/CourseAPI';
import teacherApi, { Teacher } from '../../services/apiUser/TeacherAPI';
import roomApi, { Room } from '../../services/apiUser/RoomAPI';
import shiftApi, { Shift } from '../../services/apiUser/ShiftAPI';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const DEFAULT_SHIFTS: Shift[] = [
  { id: 1, name: 'Tiết 1 (07h00 - 07h50)', startTime: '07h00', endTime: '07h50' },
  { id: 2, name: 'Tiết 2 (07h50 - 08h40)', startTime: '07h50', endTime: '08h40' },
  { id: 3, name: 'Tiết 3 (08h40 - 09h30)', startTime: '08h40', endTime: '09h30' },
  { id: 4, name: 'Tiết 4 (09h35 - 10h25)', startTime: '09h35', endTime: '10h25' },
  { id: 5, name: 'Tiết 5 (10h25 - 11h15)', startTime: '10h25', endTime: '11h15' },
  { id: 6, name: 'Tiết 6 (11h15 - 12h05)', startTime: '11h15', endTime: '12h05' },
  { id: 7, name: 'Tiết 7 (12h35 - 13h25)', startTime: '12h35', endTime: '13h25' },
  { id: 8, name: 'Tiết 8 (13h25 - 14h15)', startTime: '13h25', endTime: '14h15' },
  { id: 9, name: 'Tiết 9 (14h15 - 15h05)', startTime: '14h15', endTime: '15h05' },
  { id: 10, name: 'Tiết 10 (15h10 - 16h00)', startTime: '15h10', endTime: '16h00' },
  { id: 11, name: 'Tiết 11 (16h00 - 16h50)', startTime: '16h00', endTime: '16h50' },
  { id: 12, name: 'Tiết 12 (16h50 - 17h40)', startTime: '16h50', endTime: '17h40' },
  { id: 13, name: 'Tiết 13 (17h45 - 18h35)', startTime: '17h45', endTime: '18h35' },
  { id: 14, name: 'Tiết 14 (18h35 - 19h25)', startTime: '18h35', endTime: '19h25' },
  { id: 15, name: 'Tiết 15 (19h25 - 20h15)', startTime: '19h25', endTime: '20h15' },
];

const DAYS_OF_WEEK = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
];

const DAYS_MAP: { [key: number]: string } = {
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
  8: 'Chủ nhật',
};

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const courseRes = await courseApi.getAll();
      const teacherRes = await teacherApi.getAll();
      const roomRes = await roomApi.getAll();
      const shiftRes = await shiftApi.getAll();
      setCourses(courseRes.data.data || []);
      setTeachers(teacherRes.data.data || []);
      setRooms(roomRes.data.data || []);
      
      const loadedShifts = shiftRes.data.data || [];
      if (loadedShifts.length > 0) {
        setShifts(loadedShifts);
      } else {
        setShifts(DEFAULT_SHIFTS);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      messageApi.error('Không thể tải danh sách dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      form.setFieldsValue({
        name: course.name,
        courseCode: course.courseCode,
        teacherId: course.teacherId,
        roomId: course.roomId,
        startShiftId: course.startShiftId,
        endShiftId: course.endShiftId,
        dayOfWeek: course.dayOfWeek,
        start_date: course.start_date ? dayjs(course.start_date) : null,
        end_date: course.end_date ? dayjs(course.end_date) : null,
      });
    } else {
      setEditingCourse(null);
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
      const payload = {
        name: values.name,
        courseCode: values.courseCode,
        teacherId: values.teacherId,
        roomId: values.roomId || null,
        startShiftId: values.startShiftId || null,
        endShiftId: values.endShiftId || null,
        dayOfWeek: values.dayOfWeek || null,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
      };

      if (editingCourse && editingCourse.id) {
        await courseApi.updateCourse(editingCourse.id, payload);
        messageApi.success(`Cập nhật môn học ${values.name} thành công`);
      } else {
        await courseApi.createCourse(payload);
        messageApi.success(`Thêm môn học ${values.name} thành công`);
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

  const onDelete = async (record: Course) => {
    if (!record.id) return;
    setLoading(true);
    try {
      await courseApi.deleteCourse(record.id);
      messageApi.success(`Xóa môn học ${record.name} thành công`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      messageApi.error(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : `Giảng viên ID: ${teacherId}`;
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (course.courseCode && course.courseCode.toLowerCase().includes(searchText.toLowerCase())) ||
      getTeacherName(course.teacherId).toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderShiftText = (record: Course) => {
    const dayText = record.dayOfWeek ? DAYS_MAP[record.dayOfWeek] : '';
    const dayTag = dayText ? <Tag color="purple">{dayText}</Tag> : null;

    if (!record.startShift && !record.endShift) {
      return (
        <Space size={4} wrap>
          {dayTag}
          {!dayTag && <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa xếp ca</span>}
        </Space>
      );
    }
    if (record.startShift && !record.endShift) {
      return (
        <Space size={4} wrap>
          {dayTag}
          <Tag color="blue">{record.startShift.name}</Tag>
        </Space>
      );
    }
    if (!record.startShift && record.endShift) {
      return (
        <Space size={4} wrap>
          {dayTag}
          <Tag color="blue">{record.endShift.name}</Tag>
        </Space>
      );
    }
    
    const start = record.startShift!;
    const end = record.endShift!;
    
    if (start.id === end.id) {
      return (
        <Space size={4} wrap>
          {dayTag}
          <Tag color="blue">{start.name}</Tag>
        </Space>
      );
    }
    
    const startNum = start.name.match(/\d+/)?.[0] || '1';
    const endNum = end.name.match(/\d+/)?.[0] || '1';
    
    return (
      <Space size={4} direction="vertical" style={{ width: '100%' }}>
        {dayTag}
        <Tag color="blue" style={{ whiteSpace: 'normal', height: 'auto', padding: '3px 6px' }}>
          Tiết {startNum} - {endNum} ({start.startTime} - {end.endTime})
        </Tag>
      </Space>
    );
  };

  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: '7%',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (id: number) => <Tag color="cyan" style={{ fontSize: '12px', padding: '2px 4px' }}>ID-{id}</Tag>,
    },
    {
      title: 'Mã môn học',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: '13%',
      sorter: (a: any, b: any) => (a.courseCode || '').localeCompare(b.courseCode || ''),
      render: (courseCode: string) => (
        <span style={{ fontWeight: 600, color: '#34495e' }}>
          <BarcodeOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {courseCode}
        </span>
      ),
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      width: '22%',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#2c3e50' }}>
          <BookOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Giảng viên phụ trách',
      dataIndex: 'teacherId',
      key: 'teacherId',
      width: '18%',
      sorter: (a: any, b: any) => getTeacherName(a.teacherId).localeCompare(getTeacherName(b.teacherId)),
      render: (teacherId: number) => {
        const name = getTeacherName(teacherId);
        return (
          <span style={{ fontWeight: 500 }}>
            <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
            {name}
          </span>
        );
      },
    },
    {
      title: 'Phòng học',
      dataIndex: 'room',
      key: 'room',
      width: '13%',
      render: (room: any) => room ? (
        <span>
          <EnvironmentOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
          {room.name}
        </span>
      ) : <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa xếp phòng</span>,
    },
    {
      title: 'Ca học',
      key: 'shift',
      width: '15%',
      render: (_: any, record: Course) => renderShiftText(record),
    },
    {
      title: 'Thời gian học',
      key: 'dates',
      width: '12%',
      render: (_: any, record: Course) => {
        if (!record.start_date || !record.end_date) {
          return <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa có ngày</span>;
        }
        const startStr = dayjs(record.start_date).format('DD/MM/YYYY');
        const endStr = dayjs(record.end_date).format('DD/MM/YYYY');
        return (
          <Space direction="vertical" size={0} style={{ fontSize: '12px' }}>
            <span>BĐ: {startStr}</span>
            <span>KT: {endStr}</span>
          </Space>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa môn học">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EditOutlined style={{ color: '#13c2c2' }} />}
              style={{ borderColor: '#13c2c2' }}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa môn học?"
            description="Tất cả các đăng ký tham gia môn học này sẽ bị xóa bỏ."
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa môn học">
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}>
              Quản Lý Môn Học
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Quản lý danh sách các môn học trong trường, ca học, phòng học và giảng viên đảm nhiệm.
            </Paragraph>
          </div>
          <Button
            type="primary"
            shape="round"
            size="large"
            icon={<PlusCircleFilled style={{ color: '#ffffff' }} />}
            onClick={() => showModal()}
            style={{
              background: 'linear-gradient(90deg, #13c2c2 0%, #08979c 100%)',
              border: 'none',
              boxShadow: '0 4px 10px rgba(19,194,194,0.3)',
              fontWeight: 600,
            }}
          >
            THÊM MÔN HỌC
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo mã môn học, tên môn học hoặc giảng viên..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            size="large"
            style={{ width: 360, borderRadius: 8 }}
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
          dataSource={filteredCourses}
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
            {editingCourse ? 'CẬP NHẬT MÔN HỌC' : 'THÊM MÔN HỌC MỚI'}
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
              background: 'linear-gradient(90deg, #13c2c2 0%, #08979c 100%)',
              border: 'none',
              fontWeight: 600,
              padding: '0 24px',
            }}
          >
            Lưu thông tin
          </Button>,
        ]}
        width={580}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Mã môn học</span>}
                name="courseCode"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã môn học!' },
                  { min: 2, message: 'Mã môn học phải có ít nhất 2 ký tự!' },
                ]}
              >
                <Input prefix={<BarcodeOutlined style={{ color: '#bfbfbf' }} />} placeholder="Ví dụ: INT1306" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Tên môn học</span>}
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên môn học!' },
                  { min: 2, message: 'Tên môn học phải có ít nhất 2 ký tự!' },
                ]}
              >
                <Input prefix={<BookOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập tên môn học" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Giảng viên phụ trách</span>}
            name="teacherId"
            rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              size="large"
              style={{ borderRadius: 8 }}
              options={teachers.map((teacher) => ({
                label: teacher.name,
                value: teacher.id,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Phòng học</span>}
                name="roomId"
                rules={[{ required: true, message: 'Vui lòng chọn phòng học!' }]}
              >
                <Select
                  placeholder="Chọn phòng"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                  options={rooms.map((room) => ({
                    label: `${room.name} (${room.capacity} chỗ)`,
                    value: room.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Thứ học</span>}
                name="dayOfWeek"
                rules={[{ required: true, message: 'Vui lòng chọn thứ học!' }]}
              >
                <Select
                  placeholder="Chọn thứ học"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                  options={DAYS_OF_WEEK}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Ca bắt đầu</span>}
                name="startShiftId"
                rules={[{ required: true, message: 'Vui lòng chọn ca bắt đầu!' }]}
              >
                <Select
                  placeholder="Bắt đầu"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                  options={shifts.map((shift) => ({
                    label: shift.name,
                    value: shift.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Ca kết thúc</span>}
                name="endShiftId"
                rules={[
                  { required: true, message: 'Vui lòng chọn ca kết thúc!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startShift = getFieldValue('startShiftId');
                      if (!value || !startShift || value >= startShift) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Ca kết thúc phải sau hoặc trùng ca bắt đầu!'));
                    },
                  }),
                ]}
              >
                <Select
                  placeholder="Kết thúc"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                  options={shifts.map((shift) => ({
                    label: shift.name,
                    value: shift.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Ngày bắt đầu môn học</span>}
                name="start_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
              >
                <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  size="large"
                  style={{ borderRadius: 8, width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Ngày kết thúc môn học</span>}
                name="end_date"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue('start_date');
                      if (!value || !startDate || value.isAfter(startDate) || value.isSame(startDate, 'day')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Ngày kết thúc phải sau hoặc trùng ngày bắt đầu!'));
                    },
                  }),
                ]}
              >
                <DatePicker
                  placeholder="Chọn ngày kết thúc"
                  size="large"
                  style={{ borderRadius: 8, width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
