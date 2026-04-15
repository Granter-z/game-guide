import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Slider, Button, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { getGenres, getPlatforms } from '../services/rawgApi';

const { RangePicker } = DatePicker;

const GameFilter = ({ onFilterChange, loading }) => {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [ordering, setOrdering] = useState(null);
  const [metacriticRange, setMetacriticRange] = useState([0, 100]);

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
    if (ordering) filters.ordering = ordering;
    if (metacriticRange[0] > 0 || metacriticRange[1] < 100) {
      filters.metacritic = `${metacriticRange[0]},${metacriticRange[1]}`;
    }
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedPlatform(null);
    setOrdering(null);
    setMetacriticRange([0, 100]);
    onFilterChange({});
  };

  const orderingOptions = [
    { value: '-metacritic', label: '评分最高' },
    { value: '-released', label: '最新发布' },
    { value: '-added', label: '最受欢迎' },
    { value: 'name', label: '名称 A-Z' },
    { value: '-rating', label: '热门推荐' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FilterOutlined />
        <span className="font-semibold">筛选条件</span>
      </div>

      <Space wrap className="w-full">
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
          options={platforms.map(p => ({ value: p.id, label: p.name }))}
        />

        <Select
          placeholder="排序方式"
          allowClear
          style={{ width: 160 }}
          value={ordering}
          onChange={setOrdering}
          options={orderingOptions}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">评分:</span>
          <Slider
            range
            min={0}
            max={100}
            value={metacriticRange}
            onChange={setMetacriticRange}
            style={{ width: 120 }}
          />
          <span className="text-sm text-gray-500">{metacriticRange[0]}-{metacriticRange[1]}</span>
        </div>

        <Button type="primary" onClick={handleFilterChange} loading={loading}>
          应用筛选
        </Button>

        <Button onClick={clearFilters}>
          <ClearOutlined /> 清空
        </Button>
      </Space>
    </div>
  );
};

export default GameFilter;