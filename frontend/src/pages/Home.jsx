import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Row, Col, Spin, Select } from 'antd';
import { getGames } from '../services/rawgApi';
import GameCard from '../components/GameCard';
import useThemeStore from '../store/themeStore';

const ORDERINGS = [
  { value: '-added', label: '最受关注' },
  { value: '-metacritic', label: '评分最高' },
  { value: '-released', label: '最近发布' },
  { value: '-rating', label: '评分最佳' },
  { value: 'name', label: '名称 A-Z' },
  { value: '-name', label: '名称 Z-A' },
];

const Home = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [ordering, setOrdering] = useState('-metacritic');

  const observerRef = useRef();
  const lastGameRef = useRef(null);

  const textColor = isDark ? '#fff' : '#000';
  const textSecondary = isDark ? '#666' : '#666';

  // Fetch games when ordering changes
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setPage(1);
        // PC (端游) = 1, PS4 = 18, PS5 = 187
        const res = await getGames({ page: 1, page_size: 20, ordering, platforms: '1,18,187' });
        setGames(res.data.results || []);
        setHasMore(res.data.results?.length === 20);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [ordering]);

  // Load more games
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await getGames({ page: nextPage, page_size: 20, ordering, platforms: '1,18,187' });
      const newGames = res.data.results || [];

      if (newGames.length === 0) {
        setHasMore(false);
      } else {
        setGames(prev => [...prev, ...newGames]);
        setPage(nextPage);
        setHasMore(newGames.length === 20);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, ordering]);

  // Keep only one observer to avoid duplicate loadMore triggers.
  useEffect(() => {
    if (games.length > 0 && lastGameRef.current) {
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            loadMore();
          }
        },
        { rootMargin: '200px', threshold: 0 }
      );
      observerRef.current.observe(lastGameRef.current);
    }
  }, [games.length, loadMore, hasMore, loadingMore]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: textColor, fontSize: 28, fontWeight: 700, margin: 0 }}>
            新潮与趋势
          </h1>
          <p style={{ color: textSecondary, fontSize: 13, margin: '8px 0 0 0' }}>
            基于玩家游玩、评分和讨论数据
          </p>
        </div>
        <Select
          value={ordering}
          onChange={setOrdering}
          options={ORDERINGS}
          style={{ width: 140 }}
        />
      </div>

      {/* Game Grid */}
      <Row gutter={[16, 16]}>
        {games.map((game, index) => {
          const isLast = index === games.length - 1;
          return (
            <Col
              key={`${game.id}-${index}`}
              xs={12}
              sm={8}
              md={6}
              lg={4}
              xl={3}
            >
              <div ref={isLast ? lastGameRef : null}>
                <GameCard game={game} />
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Loading Indicator */}
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {/* End Message */}
      {!hasMore && games.length > 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: textSecondary }}>
          已加载全部 {games.length} 款游戏
        </div>
      )}
    </div>
  );
};

export default Home;