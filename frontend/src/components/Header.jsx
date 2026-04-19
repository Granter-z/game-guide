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
import useUiStore from '../store/uiStore';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const isDesktop = useUiStore((s) => s.isDesktop);

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
      className="sticky top-0 z-50 !px-3 sm:!px-6"
      style={{
        background: bgPrimary,
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        height: 64,
        lineHeight: 1,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }} className="min-w-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="min-w-0">
          <span style={{ fontSize: 20, fontWeight: 700, color: textColor }} className="sm:text-[22px] whitespace-nowrap">
            Granter
          </span>
          <span
            className="hidden sm:inline text-xs truncate max-w-[140px] md:max-w-none"
            style={{ color: textSecondary, marginLeft: 2 }}
          >
            Granter游戏图鉴
          </span>
        </div>
      </Link>

      {/* Search Bar - Center */}
      <div
        className="flex-1 min-w-0 max-w-[500px] mx-2 sm:mx-4 md:mx-10"
        style={{
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
            height: 40,
            paddingLeft: 16,
            paddingRight: 44,
            transition: 'all 0.3s ease',
            boxShadow: searchFocused
              ? isDark
                ? '0 0 0 2px rgba(255, 71, 87, 0.3), 0 4px 12px rgba(0,0,0,0.3)'
                : '0 0 0 2px rgba(255, 71, 87, 0.3), 0 4px 12px rgba(0,0,0,0.1)'
              : 'none',
            transform: searchFocused ? 'scale(1.01)' : 'scale(1)',
          }}
          className="md:!h-11 md:!pl-5"
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
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          <BulbOutlined className="hidden sm:inline" style={{ color: isDark ? '#888' : '#ffa500', fontSize: 16 }} />
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
          className="hidden sm:inline-flex"
        />

        {/* Notifications */}
        <Badge count={1} size="small" className="hidden sm:block">
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
              padding: '4px 8px',
              height: 'auto',
            }}
            className="sm:!px-3"
          >
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#ff4757' }}
            />
            <span style={{ color: textColor }} className="hidden sm:inline max-w-[96px] truncate">
              {isAuthenticated ? user?.username : '登录'}
            </span>
          </Button>
        </Dropdown>

        {/* Mobile Menu（不依赖 Tailwind 断点，避免线上旧 CSS 时按钮缺失） */}
        {!isDesktop ? (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: textColor }} />}
            onClick={() => setMobileNavOpen(true)}
            aria-label="打开导航菜单"
          />
        ) : null}
      </div>
    </AntHeader>
  );
};

export default Header;