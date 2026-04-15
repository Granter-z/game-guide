import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  SearchOutlined,
  UserOutlined,
  FireOutlined,
  TrophyOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import Header from './Header';
import useThemeStore from '../store/themeStore';

const { Sider } = AntLayout;

const Layout = () => {
  const location = useLocation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const bgPrimary = isDark ? '#151515' : '#f0f2f5';
  const bgSecondary = isDark ? '#1e1e1e' : '#ffffff';

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/games',
      icon: <AppstoreOutlined />,
      label: <Link to="/games">游戏列表</Link>,
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: <Link to="/search">搜索</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: '/chat',
      icon: <RobotOutlined />,
      label: <Link to="/chat">AI 推荐</Link>,
    },
    { type: 'divider' },
    {
      key: 'new-releases',
      icon: <FireOutlined />,
      label: '新发售',
      children: [
        { key: '/games?ordering=-released', label: <Link to="/games?ordering=-released">最近30天</Link> },
        { key: '/calendar', label: '发售日历' },
      ],
    },
    {
      key: 'top',
      icon: <TrophyOutlined />,
      label: '排行榜',
      children: [
        { key: '/games?ordering=-metacritic', label: <Link to="/games?ordering=-metacritic">评分最高</Link> },
        { key: '/games?ordering=-added', label: <Link to="/games?ordering=-added">最受关注</Link> },
        { key: '/top=250', label: <Link to="/games?top=250">Top 250</Link> },
      ],
    },
  ];

  const menuTheme = isDark ? 'dark' : 'light';

  return (
    <AntLayout className="min-h-screen" style={{ background: bgPrimary }}>
      {/* Top Header */}
      <Header />

      <AntLayout hasSider style={{ background: bgPrimary }}>
        {/* Left Sidebar */}
        <Sider
          width={220}
          className="sidebar hidden md:block"
          style={{
            background: bgSecondary,
            position: 'fixed',
            left: 0,
            top: 64,
            bottom: 0,
            overflow: 'auto',
            borderRight: isDark ? '1px solid #2a2a2a' : '1px solid #e8e8e8',
          }}
        >
          <Menu
            mode="inline"
            theme={menuTheme}
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ background: 'transparent', borderRight: 0 }}
          />
        </Sider>

        {/* Main Content */}
        <AntLayout
          style={{
            background: bgPrimary,
          }}
        >
          <div
            style={{
              padding: '24px',
              paddingLeft: '244px',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Outlet />
          </div>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;