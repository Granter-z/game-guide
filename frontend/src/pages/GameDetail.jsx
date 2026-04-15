import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Descriptions, Tag, Rate, Spin, Button, Image, Collapse, Space, message } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, StarOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
import { getGameBySlug, getGameScreenshots } from '../services/rawgApi';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import { translateToChinese } from '../services/translate';
import useAuthStore from '../store/authStore';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GameDetail = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchGameDetail();
  }, [slug]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      const res = await getGameBySlug(slug);
      const gameData = res.data;

      // 获取截图
      const screenshotsRes = await getGameScreenshots(gameData.id);
      gameData.screenshots = screenshotsRes.data?.results?.map(s => s.image) || [];

      // 自动翻译描述
      try {
        if (gameData.description_raw || gameData.description) {
          const translatedText = await translateToChinese(gameData.description_raw || gameData.description);
          gameData.translatedDescription = translatedText;
        }
      } catch (e) {
        console.error('Translation failed:', e);
        gameData.translatedDescription = gameData.description_raw || gameData.description;
      }

      setGame(gameData);

      if (isAuthenticated) {
        const favorites = await getFavorites();
        setIsFavorite(favorites.data.some(f => f.gameId === gameData.gameId));
      }
    } catch (error) {
      console.error('Failed to fetch game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.info('请先登录');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(game.gameId);
        setIsFavorite(false);
        message.success('已取消收藏');
      } else {
        await addFavorite(game.gameId, { name: game.name, background_image: game.backgroundImage });
        setIsFavorite(true);
        message.success('已添加到收藏');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRating = async (value) => {
    if (!isAuthenticated) {
      message.info('请先登录');
      return;
    }
    setUserRating(value);
    message.success('评分已保存');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!game) {
    return <div className="text-center py-10">游戏不存在</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(transparent, rgba(0,0,0,0.7)), url(${game.backgroundImage})` }}
      >
        <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
          <Title level={1} className="text-white mb-2">{game.name}</Title>
          <Space className="flex flex-wrap gap-2">
            {game.genres?.map(g => (
              <Tag key={`genre-${g.id}`} color="blue">{g.name}</Tag>
            ))}
            {game.platforms?.map(p => (
              <Tag key={`platform-${p.platform.id}`} icon={<EnvironmentOutlined />}>{p.platform.name}</Tag>
            ))}
          </Space>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="shadow-sm">
        <Space size="large">
          <Button
            type={isFavorite ? 'primary' : 'default'}
            icon={<HeartOutlined />}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? '已收藏' : '添加收藏'}
          </Button>
          <Button icon={<ShareAltOutlined />}>分享</Button>
        </Space>

        <div className="mt-4 flex items-center gap-4">
          <span>游戏评分:</span>
          <Rate allowHalf defaultValue={game.metacritic ? game.metacritic / 20 : 0} disabled />
          {game.metacritic && (
            <Tag color={game.metacritic >= 75 ? 'green' : game.metacritic >= 50 ? 'orange' : 'red'}>
              Metacritic: {game.metacritic}
            </Tag>
          )}
        </div>

        {isAuthenticated && (
          <div className="mt-4">
            <span>我要评分: </span>
            <Rate value={userRating} onChange={handleRating} allowHalf />
          </div>
        )}
      </Card>

      {/* Game Info */}
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="游戏介绍" className="mb-6">
            <Paragraph className="text-base leading-relaxed">
              {game.translatedDescription || game.description_raw || game.description || '暂无描述'}
            </Paragraph>
          </Card>

          {/* Screenshots */}
          {game.screenshots?.length > 0 && (
            <Card title="截图" className="mb-6">
              <Image.PreviewGroup>
                <Space size={4} className="flex flex-wrap">
                  {game.screenshots.map((screenshot, index) => (
                    <Image key={index} src={screenshot} width={200} className="rounded" />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Platforms */}
          <Card title="支持的平台" className="mb-6">
            <Space>
              {game.platforms?.map(p => (
                <Tag key={`platform-detail-${p.platform.id}`} color="blue">{p.platform.name}</Tag>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="游戏信息" className="mb-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="开发商">
                {game.developers?.map(d => d.name).join(', ') || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="发行商">
                {game.publishers?.map(p => p.name).join(', ') || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="发行日期">
                {game.released || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {game.genres?.map(g => g.name).join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="Metacritic评分">
                {game.metacritic || '暂无'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Tags */}
          {game.tags?.length > 0 && (
            <Card title="标签" className="mb-6">
              <Space wrap>
                {game.tags.slice(0, 15).map((tag, i) => (
                  <Tag key={`tag-${tag.id || i}`}>{tag.name}</Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Requirements */}
          {game.requirements?.minimum && (
            <Card title="系统要求" className="mb-6">
              <Collapse defaultActiveKey={['minimum']}>
                <Panel header="最低配置" key="minimum">
                  <pre className="whitespace-pre-wrap text-sm">{game.requirements.minimum}</pre>
                </Panel>
                {game.requirements.recommended && (
                  <Panel header="推荐配置" key="recommended">
                    <pre className="whitespace-pre-wrap text-sm">{game.requirements.recommended}</pre>
                  </Panel>
                )}
              </Collapse>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default GameDetail;