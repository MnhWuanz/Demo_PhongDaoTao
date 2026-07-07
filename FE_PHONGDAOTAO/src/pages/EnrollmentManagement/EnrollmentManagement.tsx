import React, { useEffect, useState } from 'react';
import {
  Button,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Card,
  Typography,
  Tooltip,
  Input,
  Drawer,
  Avatar,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  ReloadOutlined,
  SearchOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import courseApi, { Course } from '../../services/apiUser/CourseAPI';
import studentApi, { Student } from '../../services/apiUser/StudentAPI';
import enrollmentApi from '../../services/apiUser/EnrollmentAPI';

const { Title, Paragraph, Text } = Typography;

const EnrollmentManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  // Modal State for Adding Students
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<React.Key[]>([]);
  const [studentSearchText, setStudentSearchText] = useState('');

  // Drawer State for viewing course students
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCourse, setDrawerCourse] = useState<Course | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const courseRes = await courseApi.getAll();
      const studentRes = await studentApi.getAll();
      setCourses(courseRes.data.data || []);
      setStudents(studentRes.data.data || []);
      
      // Update drawer course if it's currently open
      if (drawerCourse) {
        const updated = (courseRes.data.data || []).find((c: Course) => c.id === drawerCourse.id);
        if (updated) setDrawerCourse(updated);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      messageApi.error('Không thể tải danh sách dữ liệu lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter students who are NOT in the selected class
  const getEligibleStudents = () => {
    if (!selectedCourse) return [];
    const enrolledIds = (selectedCourse.enrollments || []).map((e: any) => e.studentId);
    return students.filter(
      (student) => 
        !enrolledIds.includes(student.id) &&
        (student.fullName.toLowerCase().includes(studentSearchText.toLowerCase()) ||
         student.email.toLowerCase().includes(studentSearchText.toLowerCase()) ||
         (student.studentCode && student.studentCode.toLowerCase().includes(studentSearchText.toLowerCase())) ||
         (student.class && student.class.toLowerCase().includes(studentSearchText.toLowerCase())))
    );
  };

  const handleOpenAddModal = (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudentIds([]);
    setStudentSearchText('');
    setAddModalOpen(true);
  };

  const handleAddStudents = async () => {
    if (!selectedCourse?.id) return;
    if (selectedStudentIds.length === 0) {
      messageApi.warning('Vui lòng chọn ít nhất một sinh viên');
      return;
    }

    setLoading(true);
    try {
      const ids = selectedStudentIds.map(id => Number(id));
      await courseApi.bulkEnroll(selectedCourse.id, ids);
      messageApi.success(`Đã thêm thành công ${selectedStudentIds.length} sinh viên vào lớp.`);
      setAddModalOpen(false);
      setSelectedStudentIds([]);
      fetchData();
    } catch (error: any) {
      console.error('Failed to enroll students:', error);
      messageApi.error('Thêm sinh viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (course: Course) => {
    setDrawerCourse(course);
    setDrawerOpen(true);
  };

  const handleRemoveStudent = async (enrollmentId: number) => {
    setLoading(true);
    try {
      await enrollmentApi.deleteEnrollment(enrollmentId);
      messageApi.success('Đã xóa sinh viên ra khỏi lớp học thành công.');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete enrollment:', error);
      messageApi.error('Xóa sinh viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (course.courseCode && course.courseCode.toLowerCase().includes(searchText.toLowerCase()))
  );

  const courseColumns = [
    {
      title: 'Mã môn học',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: '15%',
      render: (code: string) => <Tag color="cyan">{code}</Tag>,
    },
    {
      title: 'Tên lớp học / Môn học',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#2c3e50' }}>
          <BookOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Giảng viên phụ trách',
      key: 'teacher',
      width: '25%',
      render: (_: any, record: Course) => record.teacher ? (
        <span>
          <UserOutlined style={{ marginRight: 6, color: '#722ed1' }} />
          {record.teacher.fullName}
        </span>
      ) : <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa phân công</span>,
    },
    {
      title: 'Sĩ số lớp',
      key: 'studentsCount',
      width: '15%',
      render: (_: any, record: Course) => {
        const count = (record.enrollments || []).length;
        return (
          <Tag color={count > 0 ? 'blue' : 'orange'} style={{ fontSize: '13px', padding: '3px 8px' }}>
            <TeamOutlined style={{ marginRight: 6 }} />
            {count} sinh viên
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Tooltip title="Thêm sinh viên vào lớp">
            <Button
              type="primary"
              shape="round"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleOpenAddModal(record)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Thêm SV
            </Button>
          </Tooltip>
          <Tooltip title="Xem danh sách sinh viên">
            <Button
              type="default"
              shape="round"
              size="small"
              icon={<TeamOutlined />}
              onClick={() => handleOpenDrawer(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f6fdf6 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}>
              Quản Lý Đăng Ký Lớp Học
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Danh sách các lớp học hiện có, số lượng sinh viên tham gia và phân phối danh sách học viên.
            </Paragraph>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo mã lớp học hoặc tên môn học..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
            size="large"
            style={{ width: 340, borderRadius: 8 }}
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
          columns={courseColumns}
          dataSource={filteredCourses}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          style={{ overflowX: 'auto' }}
          bordered
        />
      </Card>

      {/* Modal to Add Students (Multi-select) */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0C2B4E', textAlign: 'center', paddingBottom: 10 }}>
            THÊM SINH VIÊN VÀO LỚP HỌC
          </div>
        }
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setSelectedStudentIds([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => { setAddModalOpen(false); setSelectedStudentIds([]); }} style={{ borderRadius: 6 }}>
            Hủy bỏ
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            disabled={selectedStudentIds.length === 0}
            onClick={handleAddStudents}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(90deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 600,
              padding: '0 24px',
            }}
          >
            Xác nhận thêm ({selectedStudentIds.length})
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <div style={{ marginTop: 12 }}>
          {selectedCourse && (
            <AlertWrapper>
              Lớp đang chọn: <Tag color="cyan" style={{ fontSize: 13, padding: '2px 8px' }}>{selectedCourse.courseCode} - {selectedCourse.name}</Tag>
            </AlertWrapper>
          )}

          <div style={{ marginBottom: 12, marginTop: 16 }}>
            <Input
              placeholder="Tìm sinh viên theo mã số, tên hoặc email..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              size="large"
              style={{ borderRadius: 8 }}
              value={studentSearchText}
              onChange={(e) => setStudentSearchText(e.target.value)}
            />
          </div>

          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedStudentIds,
              onChange: (keys) => setSelectedStudentIds(keys),
            }}
            columns={[
              {
                title: 'Mã sinh viên',
                dataIndex: 'studentCode',
                render: (code: string) => (
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                    <IdcardOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                    {code}
                  </span>
                )
              },
              {
                title: 'Họ và tên',
                dataIndex: 'fullName',
                render: (fullName: string) => (
                  <span style={{ fontWeight: 500 }}>
                    <UserOutlined style={{ marginRight: 6, color: '#722ed1' }} />
                    {fullName}
                  </span>
                )
              },
              {
                title: 'Lớp học',
                dataIndex: 'class',
                render: (className: string) => (
                  <span style={{ fontWeight: 500, color: '#e67e22' }}>
                    <TeamOutlined style={{ marginRight: 6, color: '#e67e22' }} />
                    {className}
                  </span>
                )
              },
              {
                title: 'Email',
                dataIndex: 'email',
                render: (email: string) => (
                  <span style={{ color: '#7f8c8d' }}>
                    <MailOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                    {email}
                  </span>
                )
              }
            ]}
            dataSource={getEligibleStudents()}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            bordered
            size="small"
          />
        </div>
      </Modal>

      {/* Drawer to View Enrolled Students */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TeamOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span style={{ fontWeight: 700, color: '#0C2B4E' }}>DANH SÁCH LỚP HỌC</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        destroyOnClose
      >
        {drawerCourse && (
          <div>
            <div style={{ padding: '0 8px 16px' }}>
              <Title level={4} style={{ margin: 0, color: '#2c3e50' }}>{drawerCourse.name}</Title>
              <Text type="secondary">Mã môn học: </Text>
              <Tag color="cyan">{drawerCourse.courseCode}</Tag>
              {drawerCourse.teacher && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Giảng viên: </Text>
                  <Text strong>{drawerCourse.teacher.fullName}</Text>
                </div>
              )}
            </div>
            
            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px' }}>
              <Text strong style={{ fontSize: 15 }}>Học viên đăng ký ({(drawerCourse.enrollments || []).length})</Text>
            </div>

            <Table
              dataSource={drawerCourse.enrollments || []}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              showHeader={false}
              bordered={false}
              size="small"
              columns={[
                {
                  key: 'studentInfo',
                  render: (_: any, record: any) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#2c3e50' }}>
                            {record.student?.fullName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#7f8c8d' }}>
                            MSSV: {record.student?.studentCode} | Lớp: {record.student?.class} | {record.student?.email}
                          </div>
                        </div>
                      </div>
                      <Popconfirm
                        title="Xóa học viên khỏi lớp?"
                        description="Sinh viên này sẽ không còn trong danh sách lớp học này nữa."
                        onConfirm={() => handleRemoveStudent(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          shape="circle"
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

const AlertWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: '#e6f7ff',
    border: '1px solid #91d5ff',
    padding: '8px 12px',
    borderRadius: 8,
    color: '#0050b3',
    fontWeight: 500,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}>
    <InfoCircleOutlined />
    {children}
  </div>
);

export default EnrollmentManagement;
