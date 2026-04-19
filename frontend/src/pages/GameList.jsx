import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Pagination, Spin, Empty, Select, Button, Alert } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { getGames } from '../services/rawgApi';
import { describeApiError } from '../services/api';
import GameCard from '../components/GameCard';
import GameFilter from '../components/GameFilter';
import useThemeStore from '../store/themeStore';

const GameList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20
  });
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#a0a0a0' : '#666666';
  const borderColor = isDark ? '#2a2a2a' : '#e8e8e8';
  const cardBg = isDark ? '#242424' : '#ffffff';

  const page = parseInt(searchParams.get('page') || '1');
  const ordering = searchParams.get('ordering') || '-metacritic';
  const filters = {
    genres: searchParams.get('genres'),
    platforms: searchParams.get('platforms'),
    ordering,
    metacritic: searchParams.get('metacritic'),
    dates: searchParams.get('dates'),
    search: searchParams.get('q')
  };

  useEffect(() => {
    fetchGames();
  }, [page, searchParams]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      // PC (端游) = 1, PS4 = 18, PS5 = 187
      const params = { page, page_size: pagination.pageSize, platforms: '1,18,187', ...filters };
      Object.keys(params).forEach(key => params[key] === null && delete params[key]);

      const res = await getGames(params);
      setGames(res.data.results || []);
      setPagination(prev => ({
        ...prev,
        count: res.data.count || 0,
        next: res.data.next,
        previous: res.data.previous
      }));
      setLoadError(null);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setGames([]);
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      } else {
        params.delete(key);
      }
    });
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set('ordering', value);
    params.delete('page');
    setSearchParams(params);
  };

  const sortOptions = [
    { value: '-metacritic', label: '评分最高' },
    { value: 'metacritic', label: '评分最低' },
    { value: '-released', label: '最新发布' },
    { value: 'released', label: '最早发布' },
    { value: '-added', label: '最受关注' },
    { value: 'name', label: '名称 A-Z' },
    { value: '-name', label: '名称 Z-A' },
  ];

  return (
    <div>
      {loadError && (
        <Alert type="error" showIcon message="游戏列表加载失败" description={loadError} style={{ marginBottom: 12 }} />
      )}
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${borderColor}`,
        }}
        className="sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 style={{ color: textColor, fontSize: 20, fontWeight: 700, margin: 0 }}>
            游戏列表
          </h1>
          <p style={{ color: textSecondary, fontSize: 12, margin: '4px 0 0 0' }}>
            共 {pagination.count} 款游戏
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }} className="flex-wrap">
          {/* Sort Dropdown */}
          <Select
            value={ordering}
            onChange={handleSortChange}
            options={sortOptions}
            style={{ minWidth: 110 }}
            size="middle"
          />

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: cardBg,
              borderRadius: 6,
              padding: 2,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              size="small"
              style={{
                color: viewMode === 'grid' ? '#ff4757' : textSecondary,
                background: viewMode === 'grid' ? 'rgba(255,71,87,0.1)' : 'transparent',
                borderRadius: 4,
              }}
              onClick={() => setViewMode('grid')}
            />
            <Button
              type="text"
              icon={<UnorderedListOutlined />}
              size="small"
              style={{
                color: viewMode === 'list' ? '#ff4757' : textSecondary,
                background: viewMode === 'list' ? 'rgba(255,71,87,0.1)' : 'transparent',
                borderRadius: 4,
              }}
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <GameFilter onFilterChange={handleFilterChange} loading={loading} />

      {/* Game Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : games.length === 0 ? (
        <Empty
          description={
            <span style={{ color: textSecondary }}>{loadError ? '无法加载，请查看上方说明' : '暂无游戏数据'}</span>
          }
          style={{ padding: 40 }}
        />
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {games.map((game) => (
              <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
                <GameCard game={game} />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ textAlign: 'center', marginTop: 24, overflowX: 'auto' }}>
            <Pagination
              current={page}
              total={pagination.count}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              size="small"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameList;