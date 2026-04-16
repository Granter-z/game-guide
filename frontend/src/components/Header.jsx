import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Input, Button, Dropdown, Avatar, Badge, Switch } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  BellOutlined,
  PlusOutlined,
  MenuOutlined,
  BulbOutlined
} from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#1e1e1e' : '#ffffff';
  const bgSecondary = isDark ? '#242424' : '#f5f5f5';
  const borderColor = isDark ? '#2a2a2a' : '#e8e8e8';
  const textColor = isDark ? '#fff' : '#000000';
  const textSecondary = isDark ? '#888' : '#666';

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
    <AntHeader
      className="sticky top-0 z-50"
      style={{
        background: bgPrimary,
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: textColor }}>Granter</span>
          <span style={{ fontSize: 12, color: textSecondary, marginLeft: 4 }}>Granter游戏图鉴</span>
        </div>
      </Link>

      {/* Search Bar - Center */}
      <div
        style={{
          flex: 1,
          maxWidth: 500,
          margin: '0 40px',
          position: 'relative',
        }}
      >
        <Input
          placeholder="搜索游戏..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          size="large"
          style={{
            background: bgSecondary,
            border: `1px solid ${borderColor}`,
            borderRadius: 24,
            height: 44,
            paddingLeft: 20,
            paddingRight: 44,
            transition: 'all 0.3s ease',
            boxShadow: searchFocused
              ? isDark
                ? '0 0 0 2px rgba(255, 71, 87, 0.3), 0 4px 12px rgba(0,0,0,0.3)'
                : '0 0 0 2px rgba(255, 71, 87, 0.3), 0 4px 12px rgba(0,0,0,0.1)'
              : 'none',
            transform: searchFocused ? 'scale(1.02)' : 'scale(1)',
          }}
        />
        <Button
          type="text"
          icon={<SearchOutlined style={{ color: textSecondary }} />}
          onClick={handleSearch}
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 36,
            width: 36,
            borderRadius: '50%',
            background: '#ff4757',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            opacity: searchFocused || searchText ? 1 : 0.8,
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BulbOutlined style={{ color: isDark ? '#888' : '#ffa500', fontSize: 16 }} />
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            size="small"
          />
        </div>

        {/* Add Button */}
        <Button
          type="text"
          icon={<PlusOutlined style={{ color: textColor }} />}
        />

        {/* Notifications */}
        <Badge count={1} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ color: textColor, fontSize: 18 }} />}
          />
        </Badge>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button
            type="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              height: 'auto',
            }}
          >
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#ff4757' }}
            />
            <span style={{ color: textColor }}>
              {isAuthenticated ? user?.username : '登录'}
            </span>
          </Button>
        </Dropdown>

        {/* Mobile Menu */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: textColor }} />}
          className="md:hidden"
          onClick={() => navigate('/games')}
        />
      </div>
    </AntHeader>
  );
};

export default Header;