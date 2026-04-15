import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input, Row, Col, Card, Spin, Empty, Typography, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchGames, getGames } from '../services/rawgApi';
import api from '../services/api';
import GameCard from '../components/GameCard';

const { Title, Text } = Typography;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const translateToEnglish = async (text) => {
    try {
      const res = await api.post('/translate', { text, from: 'zh', to: 'en' });
      return res.data.result || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearched(true);

      // 如果是中文，翻译成英文再搜索
      const englishQuery = /[\u4e00-\u9fa5]/.test(searchQuery)
        ? await translateToEnglish(searchQuery)
        : searchQuery;

      const res = await searchGames(englishQuery, 1);
      setResults(res.data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue });
    }
  };

  return (
    <div className="space-y-6">
      <Title level={2}>搜索游戏</Title>

      <Input.Search
        placeholder="输入游戏名称进行搜索..."
        size="large"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSearch={handleSearch}
        enterButton={<SearchOutlined />}
        className="max-w-2xl"
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : searched ? (
        results.length === 0 ? (
          <Empty description={`未找到与 "${query}" 相关的游戏`} />
        ) : (
          <div className="space-y-4">
            <Text className="text-gray-500">
              找到 {results.length} 个与 "{query}" 相关的游戏
            </Text>
            <Row gutter={[16, 16]}>
              {results.map((game) => (
                <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
          </div>
        )
      ) : (
        <div className="text-center text-gray-400 py-12">
          <SearchOutlined className="text-5xl mb-4" />
          <p>输入关键词搜索游戏</p>
        </div>
      )}
    </div>
  );
};

export default Search;
