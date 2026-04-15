import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Row, Col, Spin, Empty, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchGames } from '../services/rawgApi';
import api from '../services/api';
import GameCard from '../components/GameCard';
import useThemeStore from '../store/themeStore';

const { Title, Text } = Typography;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#a0a0a0' : '#666666';

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

      const res = await searchGames(englishQuery, 1, '1,18,187');
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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: textColor, marginBottom: 16 }}>
          搜索游戏
        </Title>

        <Input.Search
          placeholder="输入游戏名称进行搜索..."
          size="large"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
          style={{ maxWidth: 600 }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : searched ? (
        results.length === 0 ? (
          <Empty
            description={
              <span style={{ color: textSecondary }}>
                未找到与 "{query}" 相关的游戏
              </span>
            }
          />
        ) : (
          <div>
            <Text style={{ color: textSecondary, fontSize: 14 }}>
              找到 {results.length} 个与 "{query}" 相关的游戏
            </Text>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {results.map((game) => (
                <Col key={game.id} xs={12} sm={8} md={6} lg={4}>
                  <GameCard game={game} />
                </Col>
              ))}
            </Row>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <SearchOutlined style={{ fontSize: 48, color: textSecondary, marginBottom: 16 }} />
          <p style={{ color: textSecondary, fontSize: 16 }}>输入关键词搜索游戏</p>
        </div>
      )}
    </div>
  );
};

export default Search;