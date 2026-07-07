import React, { useEffect, useState, useRef } from 'react';
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
  TeamOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import studentApi, { Student } from '../../services/apiUser/StudentAPI';
import { parseStudentExcel } from '../../utils/excelHelper';

const { Title, Paragraph } = Typography;

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // Excel Import states and refs
  const [importStudents, setImportStudents] = useState<Student[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerExcelImport = () => {
    fileInputRef.current?.click();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedStudents = await parseStudentExcel(file);
      setImportStudents(parsedStudents);
      setImportModalOpen(true);
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || 'Đọc file Excel thất bại');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < importStudents.length; i++) {
      const student = importStudents[i];
      try {
        await studentApi.createStudent(student);
        successCount++;
      } catch (error: any) {
        console.error(error);
        failCount++;
        const reason =
          error.response?.data?.message ||
          error.message ||
          'Lỗi không xác định';
        errors.push(`SV ${student.studentCode} (${student.fullName}): ${reason}`);
      }
    }

    setImporting(false);
    setImportModalOpen(false);
    setImportStudents([]);
    fetchData();

    if (failCount === 0) {
      messageApi.success(
        `Đã nhập thành công ${successCount} sinh viên từ Excel!`,
      );
    } else {
      Modal.info({
        title: 'Kết quả Import Excel',
        width: 600,
        content: (
          <div>
            <p>
              Đã nhập thành công <strong>{successCount}</strong> sinh viên.
            </p>
            <p>
              Thất bại <strong>{failCount}</strong> sinh viên.
            </p>
            {errors.length > 0 && (
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #f0f0f0',
                  padding: '10px',
                  borderRadius: '4px',
                  background: '#fafafa',
                  marginTop: '10px',
                }}
              >
                {errors.map((err, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: '#ff4d4f',
                      fontSize: '12px',
                      marginBottom: '4px',
                    }}
                  >
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAll();
      setStudents(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      messageApi.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      form.setFieldsValue(student);
    } else {
      setEditingStudent(null);
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
      if (editingStudent && editingStudent.id) {
        await studentApi.updateStudent(editingStudent.id, {
          fullName: values.fullName,
          email: values.email,
          studentCode: values.studentCode,
          class: values.class,
        });
        messageApi.success(`Cập nhật sinh viên ${values.fullName} thành công`);
      } else {
        await studentApi.createStudent({
          fullName: values.fullName,
          email: values.email,
          studentCode: values.studentCode,
          class: values.class,
        });
        messageApi.success(`Thêm sinh viên ${values.fullName} thành công`);
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

  const onDelete = async (record: Student) => {
    if (!record.id) return;
    setLoading(true);
    try {
      await studentApi.deleteStudent(record.id);
      messageApi.success(`Xóa sinh viên ${record.fullName} thành công`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      messageApi.error(
        `Xóa thất bại: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (student.studentCode &&
        student.studentCode.toLowerCase().includes(searchText.toLowerCase())) ||
      (student.class &&
        student.class.toLowerCase().includes(searchText.toLowerCase())),
  );

  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (id: number) => (
        <Tag color="blue" style={{ fontSize: '12px', padding: '2px 6px' }}>
          SV-{id}
        </Tag>
      ),
    },
    {
      title: 'Mã sinh viên',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: '15%',
      sorter: (a: any, b: any) =>
        (a.studentCode || '').localeCompare(b.studentCode || ''),
      render: (studentCode: string) => (
        <span style={{ fontWeight: 600, color: '#34495e' }}>
          <IdcardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {studentCode}
        </span>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '22%',
      sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName),
      render: (fullName: string) => (
        <span style={{ fontWeight: 500, color: '#2c3e50' }}>
          <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          {fullName}
        </span>
      ),
    },
    {
      title: 'Lớp học',
      dataIndex: 'class',
      key: 'class',
      width: '15%',
      sorter: (a: any, b: any) => (a.class || '').localeCompare(b.class || ''),
      render: (className: string) => (
        <span style={{ fontWeight: 500, color: '#e67e22' }}>
          <TeamOutlined style={{ marginRight: 8, color: '#e67e22' }} />
          {className}
        </span>
      ),
    },
    {
      title: 'Email sinh viên',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      render: (email: string) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {email}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      align: 'center' as const,
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa sinh viên?"
            description="Tất cả các đăng ký lớp của sinh viên này cũng sẽ bị ảnh hưởng."
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa sinh viên">
              <Button
                type="primary"
                danger
                ghost
                shape="circle"
                icon={<DeleteOutlined />}
              />
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title
              level={2}
              style={{ margin: 0, color: '#0C2B4E', fontWeight: 700 }}
            >
              Quản Lý Sinh Viên
            </Title>
            <Paragraph style={{ margin: 0, color: '#7f8c8d' }}>
              Danh sách sinh viên trong trường và các thao tác quản lý hồ sơ.
            </Paragraph>
          </div>
          <Space>
            <Button
              type="default"
              shape="round"
              size="large"
              icon={<FileExcelOutlined />}
              onClick={triggerExcelImport}
              style={{
                borderColor: '#52c41a',
                color: '#52c41a',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(82,196,26,0.15)',
              }}
            >
              NHẬP EXCEL
            </Button>
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<PlusCircleFilled />}
              onClick={() => showModal()}
              style={{
                background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                boxShadow: '0 4px 10px rgba(24,144,255,0.3)',
                fontWeight: 600,
              }}
            >
              THÊM SINH VIÊN
            </Button>
          </Space>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Input
            placeholder="Tìm kiếm theo mã số, tên, email hoặc lớp..."
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
          dataSource={filteredStudents}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          style={{ overflowX: 'auto' }}
          bordered
        />
      </Card>

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
            {editingStudent ? 'CẬP NHẬT SINH VIÊN' : 'THÊM SINH VIÊN MỚI'}
          </div>
        }
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            style={{ borderRadius: 6 }}
          >
            Hủy bỏ
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)',
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Mã sinh viên</span>}
            name="studentCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã sinh viên!' },
              { min: 2, message: 'Mã sinh viên phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input
              prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập mã sinh viên"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
            name="fullName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sinh viên!' },
              { min: 2, message: 'Tên phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập tên sinh viên"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Lớp học</span>}
            name="class"
            rules={[
              { required: true, message: 'Vui lòng nhập tên lớp học!' },
              { min: 2, message: 'Tên lớp học phải chứa ít nhất 2 ký tự!' },
            ]}
          >
            <Input
              prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập tên lớp học (ví dụ: D21-TH01)"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Địa chỉ Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Định dạng email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="example@student.com"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={handleExcelUpload}
      />

      {/* Excel Import Preview Modal */}
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
            XÁC NHẬN NHẬP SINH VIÊN TỪ EXCEL
          </div>
        }
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportStudents([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setImportModalOpen(false);
              setImportStudents([]);
            }}
            style={{ borderRadius: 6 }}
          >
            Hủy bỏ
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={importing}
            onClick={handleConfirmImport}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(90deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 600,
              padding: '0 24px',
            }}
          >
            Bắt đầu Nhập ({importStudents.length})
          </Button>,
        ]}
        width={750}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12, fontSize: '14px', color: '#7f8c8d' }}>
            Xem trước danh sách sinh viên được phát hiện trong file. Vui lòng
            kiểm tra kỹ trước khi bấm xác nhận nhập.
          </div>
          <Table
            dataSource={importStudents}
            rowKey="studentCode"
            pagination={{ pageSize: 5 }}
            bordered
            size="small"
            columns={[
              {
                title: 'Mã sinh viên',
                dataIndex: 'studentCode',
                render: (text) => (
                  <strong style={{ color: '#2c3e50' }}>{text}</strong>
                ),
              },
              {
                title: 'Họ và tên',
                dataIndex: 'fullName',
                render: (text) => (
                  <span>
                    <UserOutlined
                      style={{ marginRight: 6, color: '#722ed1' }}
                    />
                    {text}
                  </span>
                ),
              },
              {
                title: 'Lớp học',
                dataIndex: 'class',
                render: (text) => (
                  <span>
                    <TeamOutlined
                      style={{ marginRight: 6, color: '#e67e22' }}
                    />
                    {text}
                  </span>
                ),
              },
              {
                title: 'Email',
                dataIndex: 'email',
                render: (text) => (
                  <span>
                    <MailOutlined
                      style={{ marginRight: 6, color: '#52c41a' }}
                    />
                    {text}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;
