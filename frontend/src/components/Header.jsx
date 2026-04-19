import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Input, Button, Dropdown, Avatar, Badge, Switch } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  MenuOutlined,
  BulbOutlined
} from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const { Header: AntHeader } = Layout;

const Header = ({ onMenuClick }) => {
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
        padding: '0 12px',
        height: 64,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }} className="flex-shrink-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: textColor }}>Granter</span>
          <span style={{ fontSize: 11, color: textSecondary, marginLeft: 4 }} className="hidden sm:inline">游戏图鉴</span>
        </div>
      </Link>

      {/* Search Bar - Center */}
      <div
        style={{
          flex: 1,
          maxWidth: 500,
          margin: '0 12px',
          position: 'relative',
        }}
        className="hidden sm:block"
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
            height: 40,
            paddingLeft: 18,
            paddingRight: 40,
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
            height: 32,
            width: 32,
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

      {/* Mobile Search Icon */}
      <Button
        type="text"
        icon={<SearchOutlined style={{ color: textColor, fontSize: 18 }} />}
        className="sm:hidden flex-shrink-0"
        onClick={() => navigate('/search')}
      />

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="flex-shrink-0">
        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden md:flex">
          <BulbOutlined style={{ color: isDark ? '#888' : '#ffa500', fontSize: 16 }} />
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            size="small"
          />
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: textColor, fontSize: 18 }} />}
          className="lg:hidden"
          onClick={onMenuClick}
        />

        {/* Desktop User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" className="hidden md:block">
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

        {/* Mobile User Icon */}
        <Button
          type="text"
          icon={<UserOutlined style={{ color: textColor, fontSize: 18 }} />}
          className="md:hidden"
          onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')}
        />
      </div>
    </AntHeader>
  );
};

export default Header;