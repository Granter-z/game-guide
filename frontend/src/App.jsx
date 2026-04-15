import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Home from './pages/Home';
import GameList from './pages/GameList';
import GameDetail from './pages/GameDetail';
import Search from './pages/Search';
import Login from './pages/Login';
import Profile from './pages/Profile';

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="games" element={<GameList />} />
            <Route path="games/:slug" element={<GameDetail />} />
            <Route path="search" element={<Search />} />
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;