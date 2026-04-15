import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout as AntLayout, Menu } from 'antd';
import { HomeOutlined, AppstoreOutlined, SearchOutlined, UserOutlined, HeartOutlined } from '@ant-design/icons';
import Header from './Header';

const { Content, Footer } = AntLayout;

const Layout = () => {
  const items = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/games', icon: <AppstoreOutlined />, label: <Link to="/games">游戏列表</Link> },
    { key: '/search', icon: <SearchOutlined />, label: <Link to="/search">搜索</Link> },
    { key: '/profile', icon: <UserOutlined />, label: <Link to="/profile">个人中心</Link> }
  ];

  return (
    <AntLayout className="min-h-screen">
      <Header />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center bg-white">
        <div className="text-gray-500">
          游戏图鉴 Game Guide © 2026 - 专业端游游戏数据库
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;