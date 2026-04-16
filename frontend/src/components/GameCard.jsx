import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { PlusOutlined, HeartOutlined } from '@ant-design/icons';
import useThemeStore from '../store/themeStore';

const GameCard = ({ game, onAddFavorite }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const fallbackImage = 'https://placehold.co/400x225/242424/666?text=No+Image';

  const cardBg = isDark ? '#242424' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#888' : '#666666';
  const textTertiary = isDark ? '#666' : '#999999';
  const tagBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)';

  return (
    <Link to={`/games/${game.slug}`} className="block">
      <Card
        hoverable
        className="game-card"
        style={{
          background: cardBg,
          borderRadius: 12,
          overflow: 'hidden',
          height: '100%',
          boxShadow: isDark ? undefined : boxShadow,
          border: isDark ? undefined : '1px solid #e8e8e8',
        }}
        cover={
          <div className="game-card-cover" style={{ position: 'relative', height: 180 }}>
            <img
              src={game.background_image || fallbackImage}
              alt={game.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
            {/* Plus Button */}
            <div
              className="game-card-plus"
              onClick={(e) => {
                e.preventDefault();
                onAddFavorite && onAddFavorite(game);
              }}
            >
              <PlusOutlined />
            </div>
            {/* Heart Icon */}
            <div className="game-card-heart">
              <HeartOutlined />
            </div>
            {/* Metacritic Score */}
            {game.metacritic && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: game.metacritic >= 75 ? '#4caf50' : game.metacritic >= 50 ? '#ff9800' : '#f44336',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {game.metacritic}
              </div>
            )}
          </div>
        }
      >
        <Card.Meta
          title={
            <span
              className="game-card-title"
              style={{
                color: textColor,
                fontSize: 14,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {game.name}
            </span>
          }
          description={
            <div className="game-card-meta" style={{ color: textSecondary, fontSize: 12, marginTop: 4 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {game.genres?.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    style={{
                      background: tagBg,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              {game.released && (
                <div style={{ marginTop: 4, color: textTertiary }}>
                  {game.released}
                </div>
              )}
            </div>
          }
        />
      </Card>
    </Link>
  );
};

export default GameCard;