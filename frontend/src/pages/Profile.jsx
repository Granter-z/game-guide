import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Empty, Spin, Tabs, Button, Rate, message, Avatar } from 'antd';
import { HeartOutlined, StarOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { getFavorites, removeFavorite, getRatings, getMe } from '../services/api';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import GameCard from '../components/GameCard';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#a0a0a0' : '#666666';

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [favoritesRes, ratingsRes, userRes] = await Promise.all([
        getFavorites(),
        getRatings(),
        getMe()
      ]);
      setFavorites(favoritesRes.data || []);
      setRatings(ratingsRes.data || []);
      if (userRes.data) {
        useAuthStore.getState().setUser(userRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (gameId) => {
    try {
      await removeFavorite(gameId);
      setFavorites(favorites.filter(f => f.gameId !== gameId));
      message.success('已取消收藏');
    } catch (error) {
      message.error('操作失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="text-center">
        <Empty description="请先登录">
          <Button type="primary" href="/login">去登录</Button>
        </Empty>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const userInfo = user || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* User Info Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: '#ff4757' }} />
          <div>
            <h2 style={{ color: textColor, fontSize: 20, fontWeight: 'bold', margin: '0 0 4px 0' }}>{userInfo.username || 'User'}</h2>
            <p style={{ color: textSecondary, margin: '0 0 8px 0' }}>{userInfo.email || ''}</p>
            <Button size="small" danger icon={<LogoutOutlined />} onClick={logout}>
              退出登录
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'favorites',
              label: (
                <span style={{ color: activeTab === 'favorites' ? textColor : textSecondary }}><HeartOutlined /> 我的收藏 ({favorites.length})</span>
              ),
              children: (
                favorites.length === 0 ? (
                  <Empty description="暂无收藏" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {favorites.filter(Boolean).map((game) => game && game.gameId ? (
                      <Col key={game.gameId} xs={12} sm={8} md={6} lg={4}>
                        <div style={{ position: 'relative' }}>
                          <GameCard game={{
                            id: game.gameId,
                            slug: game.slug || game.gameId,
                            name: game.name,
                            background_image: game.backgroundImage || game.background_image,
                            metacritic: game.metacritic,
                            genres: game.genres || [],
                            released: game.released
                          }} />
                          <Button
                            type="text"
                            danger
                            size="small"
                            style={{ position: 'absolute', top: 8, right: 8 }}
                            onClick={() => handleRemoveFavorite(game.gameId)}
                          >
                            取消
                          </Button>
                        </div>
                      </Col>
                    ) : null)}
                  </Row>
                )
              )
            },
            {
              key: 'ratings',
              label: (
                <span style={{ color: activeTab === 'ratings' ? textColor : textSecondary }}><StarOutlined /> 我的评分 ({ratings.length})</span>
              ),
              children: (
                ratings.length === 0 ? (
                  <Empty description="暂无评分" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {ratings.map((rating, index) => (
                      <Card key={index} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ color: textColor, fontWeight: 600, margin: 0 }}>{rating.gameId}</h4>
                            <p style={{ color: textSecondary, fontSize: 14, margin: '4px 0 0 0' }}>{rating.comment || '无评论'}</p>
                          </div>
                          <Rate disabled value={rating.score} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default Profile;