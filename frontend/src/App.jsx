import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Home from './pages/Home';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';

// 懒加载页面组件 (首屏不需要的全部懒加载)
const GameList = lazy(() => import('./pages/GameList'));
const GameDetail = lazy(() => import('./pages/GameDetail'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

const App = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const checkAuth = useAuthStore(s => s.checkAuth);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, []);

  const antdThemeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#ff4757',
      colorBgBase: isDark ? '#151515' : '#ffffff',
      colorBgContainer: isDark ? '#242424' : '#ffffff',
      colorBgElevated: isDark ? '#242424' : '#ffffff',
      colorBgLayout: isDark ? '#151515' : '#f0f2f5',
      colorBgSpotless: isDark ? '#1e1e1e' : '#fafafa',
      colorText: isDark ? '#ffffff' : '#000000',
      colorTextSecondary: isDark ? '#a0a0a0' : '#666666',
      colorTextTertiary: isDark ? '#888888' : '#999999',
      colorBorder: isDark ? '#333333' : '#d9d9d9',
      colorBorderSecondary: isDark ? '#2a2a2a' : '#e8e8e8',
      colorFill: isDark ? '#333333' : '#f5f5f5',
      colorFillSecondary: isDark ? '#2a2a2a' : '#f0f0f0',
      colorFillTertiary: isDark ? '#242424' : '#fafafa',
      borderRadius: 8,
      wireframe: false,
    },
    components: {
      Layout: {
        headerBg: isDark ? '#1e1e1e' : '#ffffff',
        headerColor: isDark ? '#ffffff' : '#000000',
        siderBg: isDark ? '#1e1e1e' : '#ffffff',
        bodyBg: isDark ? '#151515' : '#f0f2f5',
        triggerBg: isDark ? '#242424' : '#ffffff',
        triggerColor: isDark ? '#ffffff' : '#000000',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemSelectedBg: 'rgba(255,71,87,0.15)',
        darkItemHoverBg: 'rgba(255,255,255,0.08)',
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemSelectedBg: 'rgba(255,71,87,0.1)',
        itemHoverBg: 'rgba(0,0,0,0.04)',
        itemColor: isDark ? '#a0a0a0' : '#666666',
        itemSelectedColor: isDark ? '#ffffff' : '#000000',
      },
      Card: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorBorderSecondary: isDark ? '#333333' : '#d9d9d9',
      },
      Input: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorBorder: isDark ? '#333333' : '#d9d9d9',
        colorText: isDark ? '#ffffff' : '#000000',
        colorPlaceholderText: isDark ? '#888888' : '#999999',
      },
      Button: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorBorder: isDark ? '#333333' : '#d9d9d9',
      },
      Select: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorBorder: isDark ? '#333333' : '#d9d9d9',
        colorBgElevated: isDark ? '#242424' : '#ffffff',
      },
      Tabs: {
        colorBgContainer: 'transparent',
        inkBarColor: '#ff4757',
        itemActiveColor: isDark ? '#ffffff' : '#000000',
        itemHoverColor: isDark ? '#ffffff' : '#000000',
        itemSelectedColor: isDark ? '#ffffff' : '#000000',
        itemColor: isDark ? '#a0a0a0' : '#666666',
      },
      Dropdown: {
        colorBgElevated: isDark ? '#242424' : '#ffffff',
      },
      Avatar: {
        colorBgBase: '#ff4757',
      },
      Badge: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
      },
      Spin: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
      },
      Descriptions: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorTextSecondary: isDark ? '#a0a0a0' : '#666666',
      },
      Collapse: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
        colorBorderSecondary: isDark ? '#333333' : '#d9d9d9',
      },
      Tag: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
      },
      Rate: {
        colorText: isDark ? '#a0a0a0' : '#666666',
      },
      Image: {
        colorBgContainer: isDark ? '#242424' : '#ffffff',
      },
    },
  };

  return (
    <ConfigProvider theme={antdThemeConfig} locale={zhCN}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="games" element={<GameList />} />
              <Route path="games/:slug" element={<GameDetail />} />
              <Route path="search" element={<Search />} />
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
