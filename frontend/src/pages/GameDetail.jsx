import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Typography, Descriptions, Tag, Rate, Spin, Button, Image, Collapse, Space, message } from 'antd';
import { EnvironmentOutlined, HeartOutlined, ShareAltOutlined, LinkOutlined } from '@ant-design/icons';
import { getGameBySlug } from '../services/rawgApi';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import { translateToChinese } from '../services/translate';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { getDisplayGameName } from '../utils/gameName';
import { getTutorialLinksForGame, getDownloadLinksForGame } from '../config/tutorialLinks';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const GameDetail = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#242424' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const heroImage = game?.background_image || game?.backgroundImage;
  const displayName = getDisplayGameName(game);
  const tutorialLinks = getTutorialLinksForGame(game, displayName);
  const downloadLinks = getDownloadLinksForGame(game);
  const enhancedContent = game?.enhancedContent;

  useEffect(() => {
    fetchGameDetail();
  }, [slug]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      setShowTranslated(false);
      const res = await getGameBySlug(slug);
      const gameData = res.data;
      setGame(gameData);

      if (isAuthenticated) {
        const favorites = await getFavorites();
        setIsFavorite(favorites.data.some(f => f.gameId === gameData.id.toString()));
      }
    } catch (error) {
      console.error('Failed to fetch game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateDescription = async () => {
    if (!game) return;

    if (game.translatedDescription) {
      setShowTranslated((prev) => !prev);
      return;
    }

    const rawDescription = game.description_raw || game.description;
    if (!rawDescription) {
      message.info('当前游戏暂无可翻译的介绍');
      return;
    }

    try {
      setIsTranslating(true);
      const translation = await translateToChinese(rawDescription);
      const translatedText = translation?.text || rawDescription;
      const engine = translation?.engine || 'unknown';
      setGame((prev) => (prev ? { ...prev, translatedDescription: translatedText } : prev));
      setShowTranslated(true);
      message.success(
        `翻译完成（引擎：${
          engine === 'baidu' ? '百度' : engine === 'ai' ? 'AI 兜底' : engine === 'cache' ? '本地缓存' : engine
        }）`
      );
    } catch (error) {
      console.error('Translation failed:', error);
      message.error('翻译失败，请稍后重试');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.info('请先登录');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(game.id.toString());
        setIsFavorite(false);
        message.success('已取消收藏');
      } else {
        await addFavorite(game.id.toString(), { name: displayName, background_image: heroImage });
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
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <img
          src={heroImage}
          alt={displayName}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(transparent 30%, rgba(0,0,0,0.85))'
              : 'linear-gradient(transparent 30%, rgba(255,255,255,0.9))',
          }}
        />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 w-full min-w-0">
          <Title
            level={1}
            className="!text-xl sm:!text-2xl md:!text-[32px] !leading-tight break-words pr-2"
            style={{ color: isDark ? '#fff' : '#000', marginBottom: 8 }}
          >
            {displayName}
          </Title>
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
      <Card className="shadow-sm" style={{ background: cardBg }}>
        <Space size="large" wrap>
          <Button
            type={isFavorite ? 'primary' : 'default'}
            icon={<HeartOutlined />}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? '已收藏' : '添加收藏'}
          </Button>
          <Button icon={<ShareAltOutlined />}>分享</Button>
          <Button loading={isTranslating} onClick={handleTranslateDescription}>
            {game.translatedDescription
              ? (showTranslated ? '查看原文' : '查看译文')
              : '翻译介绍'}
          </Button>
        </Space>

        <div className="mt-4 flex items-center gap-4">
          <span style={{ color: textColor }}>游戏评分:</span>
          <Rate allowHalf defaultValue={game.metacritic ? game.metacritic / 20 : 0} disabled />
          {game.metacritic && (
            <Tag color={game.metacritic >= 75 ? 'green' : game.metacritic >= 50 ? 'orange' : 'red'}>
              Metacritic: {game.metacritic}
            </Tag>
          )}
        </div>

        {isAuthenticated && (
          <div className="mt-4">
            <span style={{ color: textColor }}>我要评分: </span>
            <Rate value={userRating} onChange={handleRating} allowHalf />
          </div>
        )}
      </Card>

      {/* Game Info */}
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="游戏介绍" className="mb-6" style={{ background: cardBg }}>
            <Paragraph style={{ color: textColor }} className="text-base leading-relaxed">
              {showTranslated
                ? (game.translatedDescription || game.description_raw || game.description || '暂无描述')
                : (game.description_raw || game.description || '暂无描述')}
            </Paragraph>
          </Card>

          {enhancedContent && (
            <Card title="玩法速览" className="mb-6" style={{ background: cardBg }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Title level={5}>核心亮点</Title>
                  <ul style={{ color: textColor, paddingLeft: 18, marginBottom: 0 }}>
                    {(enhancedContent.highlights || []).map((item, idx) => (
                      <li key={`hl-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5}>新手建议</Title>
                  <ul style={{ color: textColor, paddingLeft: 18, marginBottom: 0 }}>
                    {(enhancedContent.beginnerTips || []).map((item, idx) => (
                      <li key={`bt-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </Col>
                <Col xs={24}>
                  <Title level={5}>进阶技巧</Title>
                  <ul style={{ color: textColor, paddingLeft: 18, marginBottom: 0 }}>
                    {(enhancedContent.advancedTips || []).map((item, idx) => (
                      <li key={`at-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </Col>
                {(enhancedContent.faq || []).length > 0 && (
                  <Col xs={24}>
                    <Title level={5}>常见问题</Title>
                    <Collapse>
                      {enhancedContent.faq.map((item, idx) => (
                        <Panel header={item.q} key={`faq-${idx}`}>
                          <Paragraph style={{ color: textColor, marginBottom: 0 }}>{item.a}</Paragraph>
                        </Panel>
                      ))}
                    </Collapse>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Screenshots */}
          {game.screenshots?.length > 0 && (
            <Card title="截图" className="mb-6" style={{ background: cardBg }}>
              <Image.PreviewGroup>
                <Space size={4} className="flex flex-wrap">
                  {game.screenshots.map((screenshot, index) => (
                    <Image
                      key={index}
                      src={screenshot}
                      className="rounded w-full max-w-[200px]"
                      style={{ height: 'auto' }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Platforms */}
          <Card title="支持的平台" className="mb-6" style={{ background: cardBg }}>
            <Space>
              {game.platforms?.map(p => (
                <Tag key={`platform-detail-${p.platform.id}`} color="blue">{p.platform.name}</Tag>
              ))}
            </Space>
          </Card>

          <Card title="教程与外部攻略" className="mb-6" style={{ background: cardBg }}>
            {tutorialLinks.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {tutorialLinks.map((link) => (
                  <Button
                    key={link.url}
                    type="link"
                    icon={<LinkOutlined />}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ paddingLeft: 0 }}
                  >
                    {link.title}
                  </Button>
                ))}
              </Space>
            ) : (
              <Paragraph style={{ color: textColor, marginBottom: 0 }}>
                暂无教程链接，可在 src/config/tutorialLinks.js 中为该游戏补充外部攻略地址。
              </Paragraph>
            )}
          </Card>

          <Card title="下载" className="mb-6" style={{ background: cardBg }}>
            {downloadLinks.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {downloadLinks.map((link) => (
                  <Button
                    key={link.url}
                    type="link"
                    icon={<LinkOutlined />}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ paddingLeft: 0 }}
                  >
                    {link.title}
                  </Button>
                ))}
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  进入夸克链接后，可按 Ctrl + F 搜索该游戏中文名快速定位。
                </Paragraph>
              </Space>
            ) : (
              <Paragraph style={{ color: textColor, marginBottom: 0 }}>
                暂无可用下载渠道链接。
              </Paragraph>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="游戏信息" className="mb-6" style={{ background: cardBg }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="开发商" style={{ color: textColor }}>
                {game.developers?.map(d => d.name).join(', ') || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="发行商" style={{ color: textColor }}>
                {game.publishers?.map(p => p.name).join(', ') || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="发行日期" style={{ color: textColor }}>
                {game.released || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="类型" style={{ color: textColor }}>
                {game.genres?.map(g => g.name).join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="Metacritic评分" style={{ color: textColor }}>
                {game.metacritic || '暂无'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Tags */}
          {game.tags?.length > 0 && (
            <Card title="标签" className="mb-6" style={{ background: cardBg }}>
              <Space wrap>
                {game.tags.slice(0, 15).map((tag, i) => (
                  <Tag key={`tag-${tag.id || i}`}>{tag.name}</Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Requirements */}
          {game.requirements?.minimum && (
            <Card title="系统要求" className="mb-6" style={{ background: cardBg }}>
              <Collapse defaultActiveKey={['minimum']}>
                <Panel header="最低配置" key="minimum">
                  <pre className="whitespace-pre-wrap text-sm" style={{ color: textColor }}>{game.requirements.minimum}</pre>
                </Panel>
                {game.requirements.recommended && (
                  <Panel header="推荐配置" key="recommended">
                    <pre className="whitespace-pre-wrap text-sm" style={{ color: textColor }}>{game.requirements.recommended}</pre>
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