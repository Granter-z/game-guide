import React, { useState, useEffect } from 'react';
import { Select, Slider, Button, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { getGenres, getPlatforms } from '../services/rawgApi';
import useThemeStore from '../store/themeStore';

const GameFilter = ({ onFilterChange, loading }) => {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [metacriticRange, setMetacriticRange] = useState([0, 100]);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const bgPrimary = isDark ? '#1e1e1e' : '#ffffff';
  const bgSecondary = isDark ? '#242424' : '#f5f5f5';
  const borderColor = isDark ? '#333' : '#e8e8e8';
  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#888' : '#666666';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [genresRes, platformsRes] = await Promise.all([getGenres(), getPlatforms()]);
        setGenres(genresRes.data?.results || []);
        setPlatforms(platformsRes.data?.results || []);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchFilters();
  }, []);

  const handleFilterChange = () => {
    const filters = {};
    if (selectedGenre) filters.genres = selectedGenre;
    if (selectedPlatform) filters.platforms = selectedPlatform;
    if (metacriticRange[0] > 0 || metacriticRange[1] < 100) {
      filters.metacritic = `${metacriticRange[0]},${metacriticRange[1]}`;
    }
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedPlatform(null);
    setMetacriticRange([0, 100]);
    onFilterChange({});
  };

  return (
    <div
      style={{
        background: bgPrimary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        border: isDark ? undefined : '1px solid #e8e8e8',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <FilterOutlined style={{ color: textSecondary }} />
        <span style={{ color: textSecondary, fontSize: 14 }}>筛选条件</span>
      </div>

      <Space wrap size={12}>
        <Select
          placeholder="游戏类型"
          allowClear
          style={{ width: 160 }}
          value={selectedGenre}
          onChange={setSelectedGenre}
          options={genres.map(g => ({ value: g.slug, label: g.name }))}
        />

        <Select
          placeholder="游戏平台"
          allowClear
          style={{ width: 160 }}
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          options={platforms.map(p => ({ value: p.id.toString(), label: p.name }))}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: textSecondary, fontSize: 13 }}>评分:</span>
          <Slider
            range
            min={0}
            max={100}
            value={metacriticRange}
            onChange={setMetacriticRange}
            style={{ width: 100 }}
          />
          <span style={{ color: textSecondary, fontSize: 12, minWidth: 45 }}>
            {metacriticRange[0]}-{metacriticRange[1]}
          </span>
        </div>

        <Button
          type="primary"
          onClick={handleFilterChange}
          loading={loading}
          style={{
            background: '#ff4757',
            border: 'none',
            borderRadius: 6,
          }}
        >
          应用筛选
        </Button>

        <Button
          onClick={clearFilters}
          style={{
            background: bgSecondary,
            border: `1px solid ${borderColor}`,
            color: textSecondary,
            borderRadius: 6,
          }}
        >
          <ClearOutlined /> 清空
        </Button>
      </Space>
    </div>
  );
};

export default GameFilter;