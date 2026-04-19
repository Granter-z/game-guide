import React, { useEffect, useRef, useState } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Typography, Tag, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ClearOutlined, PlusOutlined } from '@ant-design/icons';
import useChatStore from '../store/chatStore';
import useThemeStore from '../store/themeStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Chat = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const messagesEndRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage, clearMessages, createSession } = useChatStore();

  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#a0a0a0' : '#666666';
  const cardBg = isDark ? '#242424' : '#ffffff';
  const inputBg = isDark ? '#1e1e1e' : '#f5f5f5';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const value = inputValue.trim();
    if (!value || isLoading) return;
    setInputValue('');
    await sendMessage(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }} className="sm:calc(100vh - 180px)">
      {/* 头部 */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 12,
          gap: 8
        }}
      >
        <div>
          <Title level={3} style={{ color: textColor, margin: 0 }}>
            <RobotOutlined style={{ marginRight: 6 }} />
            AI 推荐
          </Title>
          <Text style={{ color: textSecondary, fontSize: 12 }}>
            告诉我你喜欢什么游戏
          </Text>
        </div>
        <Button icon={<PlusOutlined />} onClick={createSession} size="small">新对话</Button>
      </div>

      {/* 消息列表 */}
      <Card
        style={{ flex: 1, overflow: 'auto', background: cardBg, marginBottom: 12 }}
        styles={{ body: { height: '100%', overflow: 'auto', padding: '12px' } }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: textSecondary }}>
            <RobotOutlined style={{ fontSize: 40, marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>开始对话，告诉我你喜欢什么游戏</p>
            <p style={{ fontSize: 11, marginTop: 8 }}>
              例如: "推荐一些RPG游戏"
            </p>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', border: 'none', padding: '6px 0' }}>
                <div style={{ maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {msg.role === 'assistant' ? <Avatar icon={<RobotOutlined />} size="small" style={{ background: '#ff4757' }} /> : null}
                    <Text strong style={{ color: textSecondary, fontSize: 11 }}>
                      {msg.role === 'user' ? '你' : 'AI'}
                    </Text>
                  </div>
                  <Card
                    size="small"
                    style={{
                      background: msg.role === 'user' ? '#ff4757' : cardBg,
                      color: msg.role === 'user' ? (isDark ? '#fff' : '#000') : textColor,
                      border: msg.role === 'user' ? 'none' : (isDark ? '1px solid #333' : '1px solid #e8e8e8')
                    }}
                    styles={{ body: { padding: '10px' } }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 13 }}>{msg.content}</div>

                    {/* AI 推荐的游戏卡片 */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Text strong style={{ color: textColor, display: 'block', marginBottom: 6, fontSize: 12 }}>
                          为你推荐:
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.recommendations.map((game, idx) => (
                            <Tag
                              key={idx}
                              style={{ cursor: 'pointer', padding: '2px 6px', fontSize: 11 }}
                              color="blue"
                              onClick={() => window.location.href = `/games/${game.slug}`}
                            >
                              {game.name} {game.metacritic ? `(${game.metacritic})` : ''}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </List.Item>
            )}
          />
        )}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <Spin tip="思考中..." size="small" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* 输入区域 */}
      <Card style={{ background: cardBg }} styles={{ body: { padding: '8px 12px' } }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <TextArea
            placeholder="输入问题..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{
              flex: 1,
              background: inputBg,
              borderRadius: 6,
              fontSize: 14,
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isLoading}
            onClick={handleSend}
            style={{ borderRadius: 6 }}
          />
          <Button
            icon={<ClearOutlined />}
            onClick={clearMessages}
            style={{ borderRadius: 6 }}
            size="small"
          />
        </div>
      </Card>
    </div>
  );
};

export default Chat;