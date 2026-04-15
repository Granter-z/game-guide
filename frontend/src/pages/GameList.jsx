import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Pagination, Spin, Empty, Select } from 'antd';
import { getGames } from '../services/rawgApi';
import GameCard from '../components/GameCard';
import GameFilter from '../components/GameFilter';

const GameList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20
  });

  const page = parseInt(searchParams.get('page') || '1');
  const filters = {
    genres: searchParams.get('genres'),
    platforms: searchParams.get('platforms'),
    ordering: searchParams.get('ordering') || '-metacritic',
    metacritic: searchParams.get('metacritic'),
    search: searchParams.get('q')
  };

  useEffect(() => {
    fetchGames();
  }, [page, searchParams]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const params = { page, page_size: pagination.pageSize, ...filters };
      Object.keys(params).forEach(key => params[key] === null && delete params[key]);

      const res = await getGames(params);
      setGames(res.data.results || []);
      setPagination(prev => ({
        ...prev,
        count: res.data.count || 0,
        next: res.data.next,
        previous: res.data.previous
      }));
    } catch (error) {
      console.error('Failed to fetch games:', error);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">游戏列表</h1>

      <GameFilter onFilterChange={handleFilterChange} loading={loading} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : games.length === 0 ? (
        <Empty description="暂无游戏数据" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {games.map((game) => (
              <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
                <GameCard game={game} />
              </Col>
            ))}
          </Row>

          <div className="flex justify-center mt-8">
            <Pagination
              current={page}
              total={pagination.count}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameList;