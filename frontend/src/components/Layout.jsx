import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Drawer, Button } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  SearchOutlined,
  UserOutlined,
  FireOutlined,
  TrophyOutlined,
  RobotOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import Header from './Header';
import useThemeStore from '../store/themeStore';

const { Sider } = AntLayout;

const Layout = () => {
  const location = useLocation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bgPrimary = isDark ? '#151515' : '#f0f2f5';
  const bgSecondary = isDark ? '#1e1e1e' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const today = new Date();

  const toDateString = (date) => date.toISOString().slice(0, 10);
  const addDays = (date, days) => {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
  };
  const buildDatesParam = (start, end) => `${toDateString(start)},${toDateString(end)}`;

  const recent30Dates = buildDatesParam(addDays(today, -30), today);
  const upcoming90Dates = buildDatesParam(today, addDays(today, 90));
  const thisYearDates = buildDatesParam(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31));
  const pathnameWithSearch = `${location.pathname}${location.search}`;

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
        {
          key: `/games?ordering=-released&dates=${recent30Dates}`,
          label: <Link to={`/games?ordering=-released&dates=${recent30Dates}`}>最近30天</Link>
        },
        {
          key: `/games?ordering=released&dates=${upcoming90Dates}`,
          label: <Link to={`/games?ordering=released&dates=${upcoming90Dates}`}>即将发售</Link>
        },
        {
          key: `/games?ordering=-released&dates=${thisYearDates}`,
          label: <Link to={`/games?ordering=-released&dates=${thisYearDates}`}>今年发售</Link>
        },
      ],
    },
    {
      key: 'top',
      icon: <TrophyOutlined />,
      label: '排行榜',
      children: [
        { key: '/games?ordering=-metacritic', label: <Link to="/games?ordering=-metacritic">评分最高</Link> },
        { key: '/games?ordering=-added', label: <Link to="/games?ordering=-added">最受关注</Link> },
        { key: '/games?ordering=-rating', label: <Link to="/games?ordering=-rating">玩家口碑</Link> },
        { key: '/games?ordering=-metacritic&metacritic=80,100', label: <Link to="/games?ordering=-metacritic&metacritic=80,100">Top 250（高分池）</Link> },
      ],
    },
  ];

  const menuTheme = isDark ? 'dark' : 'light';

  const renderMobileMenu = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold" style={{ color: textColor }}>菜单</span>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setMobileMenuOpen(false)}
        />
      </div>
      <Menu
        mode="inline"
        theme={menuTheme}
        selectedKeys={[pathnameWithSearch]}
        defaultOpenKeys={['new-releases', 'top']}
        items={menuItems}
        style={{ background: 'transparent', borderRight: 0 }}
        onClick={() => setMobileMenuOpen(false)}
      />
    </div>
  );

  return (
    <AntLayout className="min-h-screen" style={{ background: bgPrimary }}>
      {/* Top Header */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      <AntLayout hasSider style={{ background: bgPrimary }}>
        {/* Desktop Sidebar */}
        <Sider
          width={220}
          className="sidebar hidden lg:block"
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
            selectedKeys={[pathnameWithSearch]}
            defaultOpenKeys={['new-releases', 'top']}
            items={menuItems}
            style={{ background: 'transparent', borderRight: 0 }}
          />
        </Sider>

        {/* Mobile Drawer Menu */}
        <Drawer
          title={null}
          placement="left"
          closable={false}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          styles={{ body: { padding: 0, background: bgSecondary } }}
        >
          {renderMobileMenu()}
        </Drawer>

        {/* Main Content */}
        <AntLayout
          style={{
            background: bgPrimary,
          }}
        >
          <div
            style={{
              padding: '16px',
              paddingLeft: 'clamp(16px, 4vw, 244px)',
              minHeight: 'calc(100vh - 64px)',
            }}
            className="w-full overflow-x-hidden"
          >
            <Outlet />
          </div>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;