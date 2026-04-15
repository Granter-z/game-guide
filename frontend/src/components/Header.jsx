import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Input, Button, Dropdown, Avatar } from 'antd';
import { SearchOutlined, MenuOutlined, UserOutlined, LogoutOutlined, HeartOutlined } from '@ant-design/icons';
import useAuthStore from '../store/authStore';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText)}`);
      setSearchText('');
    }
  };

  const userMenuItems = isAuthenticated ? [
    { key: 'profile', label: <Link to="/profile">个人中心</Link> },
    { key: 'favorites', label: <Link to="/profile?tab=favorites">我的收藏</Link>, icon: <HeartOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: logout }
  ] : [
    { key: 'login', label: <Link to="/login">登录</Link> }
  ];

  return (
    <AntHeader className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 bg-white shadow-md">
      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/" className="text-xl font-bold text-primary">
          游戏图鉴
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">首页</Link>
          <Link to="/games" className="text-gray-700 hover:text-primary transition-colors">游戏列表</Link>
          <Link to="/search" className="text-gray-700 hover:text-primary transition-colors">搜索</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索游戏..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          className="w-48 md:w-64"
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="hidden md:inline">{isAuthenticated ? user?.username : '登录'}</span>
          </Button>
        </Dropdown>

        <Button
          type="text"
          icon={<MenuOutlined />}
          className="md:hidden"
          onClick={() => navigate('/games')}
        />
      </div>
    </AntHeader>
  );
};

export default Header;