import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../UI/Logo';
import {
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  SolutionOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, type MenuProps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  };
}

// Nội dung menu khớp với cơ sở dữ liệu và controllers của backend
const items = [
  getItem('Quản lý Sinh viên', 'students', <TeamOutlined />),
  getItem('Quản lý Giảng viên', 'teachers', <UserOutlined />),
  getItem('Quản lý Phòng học', 'rooms', <HomeOutlined />),
  getItem('Quản lý Môn học', 'courses', <BookOutlined />),
  getItem('Quản lý Đăng ký lớp', 'enrollments', <SolutionOutlined />),
  getItem('Đồng bộ đào tạo', 'sync', <CloudSyncOutlined />),
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const selectKey = useMemo(() => {
    const p = location.pathname.replace(/^\/+/, '');
    if (!p) return 'students';
    return p.split('/')[0];
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          boxShadow: '4px 0 16px rgba(0,21,41,0.08)',
          zIndex: 10,
        }}
      >
        <Logo name="" imgSrc={'/logo.png'} height={'50'} width={'full'} />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={selectKey ? [selectKey] : []}
          onClick={(e) => {
            navigate(`/${e.key}`);
          }}
          style={{
            fontSize: '14px',
            paddingTop: '8px',
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#0C2B4E',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div>
            <CalendarOutlined style={{ color: 'white' }} />
            <span style={{ color: 'white', marginLeft: '10px', fontWeight: 500 }}>
              Hôm nay: {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
        </Header>

        <Content style={{ margin: '16px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 140px)',
              background: '#F0F2F5',
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', color: '#7f8c8d' }}>
          STU ©{new Date().getFullYear()} Created by MnhWua - Hệ thống quản lý đào tạo
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
