import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Card, Row, Col, Typography, Spin } from 'antd';
import { RightOutlined, TrophyOutlined, FireOutlined, RocketOutlined } from '@ant-design/icons';
import { getGames } from '../services/rawgApi';
import GameCard from '../components/GameCard';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [popularGames, setPopularGames] = useState([]);
  const [newGames, setNewGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const [featured, popular, newGamesRes] = await Promise.all([
          getGames({ page_size: 5, ordering: '-metacritic' }),
          getGames({ page_size: 8, ordering: '-added' }),
          getGames({ page_size: 8, ordering: '-released' })
        ]);
        setFeaturedGames(featured.data.results || []);
        setPopularGames(popular.data.results || []);
        setNewGames(newGamesRes.data.results || []);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <Carousel autoplay className="rounded-lg overflow-hidden shadow-lg">
        {featuredGames.slice(0, 3).map((game) => (
          <div key={game.id}>
            <Link to={`/games/${game.slug}`}>
              <div
                className="h-64 md:h-96 bg-cover bg-center flex items-end"
                style={{
                  backgroundImage: `linear-gradient(transparent, rgba(0,0,0,0.8)), url(${game.background_image})`
                }}
              >
                <div className="p-6 md:p-10 text-white w-full md:w-2/3">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">{game.name}</h2>
                  <p className="text-sm md:text-base text-gray-200 mb-2">
                    {game.genres?.map(g => g.name).join(' · ')}
                  </p>
                  <div className="flex gap-4">
                    {game.metacritic && (
                      <span className="bg-green-500 px-3 py-1 rounded font-bold">
                        Metacritic: {game.metacritic}
                      </span>
                    )}
                    {game.released && (
                      <span className="bg-white/20 px-3 py-1 rounded">
                        {game.released}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Carousel>

      {/* Categories Quick Access */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Link to="/games?genres=action">
            <Card hoverable className="text-center bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <FireOutlined className="text-4xl mb-2" />
              <Title level={4} className="text-white mb-0">动作游戏</Title>
              <Paragraph className="text-white/80 mb-0">紧张刺激的战斗体验</Paragraph>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          <Link to="/games?genres=role-playing-games-rpg">
            <Card hoverable className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <TrophyOutlined className="text-4xl mb-2" />
              <Title level={4} className="text-white mb-0">角色扮演</Title>
              <Paragraph className="text-white/80 mb-0">史诗般的冒险故事</Paragraph>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          <Link to="/games?genres=indie">
            <Card hoverable className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <RocketOutlined className="text-4xl mb-2" />
              <Title level={4} className="text-white mb-0">独立游戏</Title>
              <Paragraph className="text-white/80 mb-0">创意无限的精品游戏</Paragraph>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Popular Games */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} className="mb-0">热门游戏</Title>
          <Link to="/games?ordering=-added" className="flex items-center text-primary">
            查看更多 <RightOutlined />
          </Link>
        </div>
        <Row gutter={[16, 16]}>
          {popularGames.map((game) => (
            <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
              <GameCard game={game} />
            </Col>
          ))}
        </Row>
      </section>

      {/* New Games */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} className="mb-0">最新发布</Title>
          <Link to="/games?ordering=-released" className="flex items-center text-primary">
            查看更多 <RightOutlined />
          </Link>
        </div>
        <Row gutter={[16, 16]}>
          {newGames.map((game) => (
            <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
              <GameCard game={game} />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default Home;