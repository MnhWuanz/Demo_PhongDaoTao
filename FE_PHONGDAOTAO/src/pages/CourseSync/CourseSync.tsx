import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Tag,
  Modal,
  message,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Badge,
  Spin,
  Alert,
  Tabs,
  Tooltip,
} from 'antd';
import {
  SyncOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  CloudSyncOutlined,
  BookOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import courseApi, { Course } from '../../services/apiUser/CourseAPI';
import syncApi, { SyncLog } from '../../services/apiUser/SyncAPI';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const CourseSync = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isCanSync, setIsCanSync] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<React.Key[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const loadData = async () => {
    setLoading(true);
    try {
      const courseRes = await courseApi.getAll();
      const logsRes = await syncApi.getLogs();
      const fetchedCourses = courseRes.data.data || [];
      setCourses(fetchedCourses);
      setSyncLogs(logsRes.data.data || []);
      if (fetchedCourses.length > 0) {
        setPreviewCourse(fetchedCourses[0]);
      }
    } catch (error: any) {
      console.error('Failed to load sync data:', error);
      messageApi.error('Không thể tải danh sách dữ liệu đồng bộ');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    if (selectedCourseIds.length === 0) {
      messageApi.warning('Vui lòng chọn ít nhất một lớp học để đồng bộ');
      return;
    }

    const selectedIdsNum = selectedCourseIds.map(Number);
    const alreadySyncedCourses = courses.filter(
      (c) =>
        selectedIdsNum.includes(Number(c.id)) &&
        syncLogs.some(
          (log) =>
            Number(log.courseId) === Number(c.id) && log.status === 'SUCCESS',
        ),
    );
    if (alreadySyncedCourses.length > 0) {
      const names = alreadySyncedCourses.map((c) => c.name).join(', ');
      modal.confirm({
        title: 'Xác nhận cập nhật đồng bộ',
        content: `Lớp (${names}) đã được đồng bộ thành công trước đó. Bạn có muốn cập nhật lại thông tin đồng bộ không?`,
        okText: 'Đồng ý cập nhật',
        cancelText: 'Hủy bỏ',
        okButtonProps: { danger: true },
        onOk: () => {
          executeSync();
        },
      });
    } else {
      executeSync();
    }
  };

  const executeSync = async () => {
    setSyncing(true);
    try {
      const ids = selectedCourseIds.map((id) => Number(id));
      const res = await syncApi.syncCourses(ids);
      const results = res.data.data || [];
      const successCount = results.filter(
        (r: any) => r.log.status === 'SUCCESS',
      ).length;
      const failedCount = results.length - successCount;
      if (failedCount === 0) {
        messageApi.success(
          `Đồng bộ thành công ${successCount}/${results.length} lớp học.`,
        );
      } else {
        messageApi.warning(
          `Đồng bộ hoàn tất: ${successCount} thành công, ${failedCount} thất bại.`,
        );
      }
      setModalOpen(false);
      setSelectedCourseIds([]);
      loadData();
    } catch (error: any) {
      console.error('Sync failed:', error);
      messageApi.error('Quá trình đồng bộ gặp sự cố kết nối.');
    } finally {
      setSyncing(false);
    }
  };
  const checkConnection = async () => {
    console.log('click');
    setIsCanSync(true);
    try {
      const res = await syncApi.checkConnection();
      if (res.data.success) {
        messageApi.success(res.data.message);
        setIsCanSync(false);
      } else {
        messageApi.error(res.data.message);
      }
    } catch (error: any) {
      messageApi.error('Quá trình đồng bộ gặp sự cố kết nối.');
    }
  };

  const getPayloadPreview = (course: Course) => {
    const mapDayOfWeek = (dateStr?: string | null) => {
      if (!dateStr) return 2;
      const date = new Date(dateStr);
      const day = date.getDay();
      if (day === 0) return 8; // Sunday
      return day + 1; // Mon -> 2, Tue -> 3...
    };

    const formatDate = (dateStr?: string | null) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };
    const payload = {
      classSectionId: `LHP-2026-${course.courseCode}-${String(course.id).padStart(2, '0')}`,
      subjectName: course.name,
      room: course.room
        ? {
            roomId: `ROOM-${course.room.name.replace(/\s+/g, '')}`,
            roomName: course.room.name,
          }
        : null,
      teacher: course.teacher
        ? {
            teacherId: course.teacher.teacherCode,
            fullName: course.teacher.name,
            email: course.teacher.email,
          }
        : null,
      schedules: [
        {
          dayOfWeek: course.dayOfWeek || mapDayOfWeek(course.start_date),
          startTime: course.startShift?.startTime || '07:00',
          endTime: course.endShift?.endTime || '09:30',
          startDate: formatDate(course.start_date),
          endDate: formatDate(course.end_date),
        },
      ],
      students: (course.enrollments || []).map((e: any) => ({
        studentId: e.student?.studentCode || '',
        fullName: e.student?.name || '',
        email: e.student?.email || '',
        class: e.student?.class,
      })),
    };
    return JSON.stringify(payload, null, 2);
  };
  const successLogsCount = syncLogs.filter(
    (l) => l.status === 'SUCCESS',
  ).length;
  const failedLogsCount = syncLogs.filter((l) => l.status === 'FAILED').length;

  const courseColumns = [
    {
      title: 'Mã lớp',
      dataIndex: 'courseCode',
      key: 'courseCode',
      render: (code: string, record: Course) => (
        <span style={{ fontWeight: 600 }}>
          LHP-2026-{code}-{String(record.id).padStart(2, '0')}
        </span>
      ),
    },
    {
      title: 'Tên lớp học / Môn học',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span>
          <BookOutlined style={{ marginRight: 6, color: '#13c2c2' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Phòng học / Ca học',
      key: 'roomShift',
      render: (_: any, record: Course) => {
        const roomName = record.room?.name || 'Chưa xếp phòng';
        const start = record.startShift?.name.match(/\d+/)?.[0] || '1';
        const end = record.endShift?.name.match(/\d+/)?.[0] || '1';
        return (
          <span>
            {roomName} (Tiết {start}-{end})
          </span>
        );
      },
    },
    {
      title: 'Sĩ số SV',
      key: 'studentCount',
      render: (_: any, record: Course) => (
        <Tag color="cyan">{(record.enrollments || []).length} sinh viên</Tag>
      ),
    },
  ];

  const logColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '18%',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Môn học',
      dataIndex: 'courseName',
      key: 'courseName',
      width: '22%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: 'SUCCESS' | 'FAILED') => (
        <Tag
          color={status === 'SUCCESS' ? 'success' : 'error'}
          icon={
            status === 'SUCCESS' ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {status === 'SUCCESS' ? 'THÀNH CÔNG' : 'THẤT BẠI'}
        </Tag>
      ),
    },
    {
      title: 'Chi tiết thông báo hệ thống',
      dataIndex: 'message',
      key: 'message',
      width: '45%',
      render: (text: string, record: SyncLog) => (
        <Text
          type={record.status === 'SUCCESS' ? 'success' : 'danger'}
          style={{ fontSize: '13px' }}
        >
          {text}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {contextHolder}
      {modalContextHolder}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title
              level={2}
              style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}
            >
              Đồng Bộ Dữ Liệu Đào Tạo
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Truyền tải thông tin lớp học và đăng ký sinh viên trực tiếp sang
              hệ thống đào tạo liên kết khác.
            </Paragraph>
          </div>
          <Space size="middle">
            <Button
              icon={<CheckOutlined />}
              size="large"
              loading={isCanSync}
              style={{ borderRadius: 8 }}
              onClick={checkConnection}
            >
              Kiểm tra kết nối
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>

            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<CloudSyncOutlined />}
              onClick={() => setModalOpen(true)}
              style={{
                background: 'linear-gradient(90deg, #13c2c2 0%, #08979c 100%)',
                border: 'none',
                boxShadow: '0 4px 10px rgba(19,194,194,0.3)',
                fontWeight: 600,
              }}
            >
              ĐỒNG BỘ DỮ LIỆU
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <StatisticCardTitle>Tổng số lớp học</StatisticCardTitle>
            <StatisticCardValue style={{ color: '#0c2b4e' }}>
              {courses.length}
            </StatisticCardValue>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <StatisticCardTitle>Lần đồng bộ thành công</StatisticCardTitle>
            <StatisticCardValue style={{ color: '#52c41a' }}>
              {successLogsCount}
            </StatisticCardValue>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <StatisticCardTitle>Lần đồng bộ thất bại</StatisticCardTitle>
            <StatisticCardValue style={{ color: '#ff4d4f' }}>
              {failedLogsCount}
            </StatisticCardValue>
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="logs"
        style={{
          background: 'white',
          padding: 24,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
        items={[
          {
            key: 'logs',
            label: (
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                <ClockCircleOutlined /> Lịch sử Log đồng bộ
              </span>
            ),
            children: (
              <Table
                columns={logColumns}
                dataSource={syncLogs}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 7 }}
                bordered
              />
            ),
          },
          {
            key: 'preview',
            label: (
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                <CodeOutlined /> Xem cấu trúc JSON gửi đi
              </span>
            ),
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Alert
                    message="Chọn môn học để xem thử cấu trúc dữ liệu JSON được BE tự động cấu trúc để gửi đi."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={courseColumns}
                    dataSource={courses}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                    onRow={(record) => ({
                      onClick: () => setPreviewCourse(record),
                      style: {
                        cursor: 'pointer',
                        background:
                          previewCourse?.id === record.id ? '#e6f7f7' : '',
                      },
                    })}
                    bordered
                  />
                </Col>
                <Col span={12}>
                  <Card
                    title={
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>
                          Dữ liệu JSON giả lập gửi đi:{' '}
                          <Tag color="cyan">{previewCourse?.courseCode}</Tag>
                        </span>
                        <Tooltip title="Xem cấu trúc dữ liệu gửi qua API ngoại vi">
                          <CodeOutlined style={{ color: '#13c2c2' }} />
                        </Tooltip>
                      </div>
                    }
                    bordered
                    style={{
                      borderRadius: 12,
                      background: '#1e1e1e',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    headStyle={{
                      color: '#ffffff',
                      borderBottom: '1px solid #333333',
                      background: '#252526',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        color: '#a9b7c6',
                        fontSize: '12px',
                        fontFamily: 'Consolas, Courier New, monospace',
                        overflowX: 'auto',
                        maxHeight: '380px',
                      }}
                    >
                      {previewCourse
                        ? getPayloadPreview(previewCourse)
                        : '// Chọn môn học để xem cấu trúc JSON'}
                    </pre>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Modal
        title={
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0C2B4E',
              textAlign: 'center',
              paddingBottom: 10,
            }}
          >
            CHỌN LỚP HỌC ĐỂ ĐỒNG BỘ
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          if (!syncing) {
            setModalOpen(false);
            setSelectedCourseIds([]);
          }
        }}
        footer={[
          <Button
            key="cancel"
            disabled={syncing}
            onClick={() => {
              setModalOpen(false);
              setSelectedCourseIds([]);
            }}
            style={{ borderRadius: 6 }}
          >
            Hủy bỏ
          </Button>,
          <Button
            key="sync"
            type="primary"
            loading={syncing}
            onClick={handleSync}
            disabled={selectedCourseIds.length === 0}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(90deg, #13c2c2 0%, #08979c 100%)',
              border: 'none',
              fontWeight: 600,
              padding: '0 24px',
            }}
          >
            Bắt đầu đồng bộ ({selectedCourseIds.length})
          </Button>,
        ]}
        width={750}
        destroyOnClose
      >
        <div style={{ marginTop: 12 }}>
          <Alert
            message="Tick chọn những môn học muốn đẩy dữ liệu qua hệ thống đào tạo liên kết. Bạn có thể chọn nhiều lớp cùng lúc."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedCourseIds,
              onChange: (keys) => setSelectedCourseIds(keys),
            }}
            columns={[
              {
                title: 'Mã lớp học',
                dataIndex: 'courseCode',
                render: (code: string, r: Course) => (
                  <strong>
                    LHP-2026-{code}-{String(r.id).padStart(2, '0')}
                  </strong>
                ),
              },
              {
                title: 'Tên lớp học',
                dataIndex: 'name',
              },
              {
                title: 'Trạng thái',
                key: 'syncStatus',
                render: (_, r: Course) => {
                  const isSynced = syncLogs.some(
                    (log) => log.courseId === r.id && log.status === 'SUCCESS',
                  );
                  return isSynced ? (
                    <Tag color="success">Đã đồng bộ</Tag>
                  ) : (
                    <Tag color="default">Chưa đồng bộ</Tag>
                  );
                },
              },
              {
                title: 'Số sinh viên',
                render: (_, r: Course) => (
                  <Tag color="blue">
                    {(r.enrollments || []).length} học viên
                  </Tag>
                ),
              },
            ]}
            dataSource={courses}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            bordered
          />
        </div>
      </Modal>
    </div>
  );
};

const StatisticCardTitle = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      fontSize: '13px',
      color: '#7f8c8d',
      display: 'block',
      marginBottom: 4,
      fontWeight: 500,
    }}
  >
    {children}
  </Text>
);

const StatisticCardValue = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <Title level={3} style={{ margin: 0, fontWeight: 700, ...style }}>
    {children}
  </Title>
);

export default CourseSync;
