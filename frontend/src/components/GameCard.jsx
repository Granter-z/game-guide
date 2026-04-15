import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Rate, Image } from 'antd';
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const GameCard = ({ game }) => {
  const fallbackImage = 'https://imgbed.cn/file/placeholder/400x225.png';

  return (
    <Link to={`/games/${game.slug}`} className="block">
      <Card
        hoverable
        className="game-card h-full overflow-hidden"
        cover={
          <div className="relative overflow-hidden aspect-video">
            <Image
              src={game.background_image || fallbackImage}
              alt={game.name}
              fallback={fallbackImage}
              className="w-full h-full object-cover"
              preview={false}
            />
            {game.metacritic && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-sm font-bold ${
                game.metacritic >= 75 ? 'bg-green-500' : game.metacritic >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {game.metacritic}
              </div>
            )}
          </div>
        }
      >
        <Card.Meta
          title={<span className="font-semibold text-base">{game.name}</span>}
          description={
            <div className="space-y-1 mt-2">
              <div className="flex flex-wrap gap-1">
                {game.genres?.slice(0, 3).map((genre) => (
                  <span key={genre.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {game.released && (
                  <span className="flex items-center gap-1">
                    <CalendarOutlined /> {game.released}
                  </span>
                )}
                {game.platforms?.slice(0, 2).map((p) => (
                  <span key={p.platform.id} className="flex items-center gap-1">
                    <EnvironmentOutlined /> {p.platform.name}
                  </span>
                ))}
              </div>
            </div>
          }
        />
      </Card>
    </Link>
  );
};

export default GameCard;