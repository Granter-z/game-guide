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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ color: textColor, margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            AI 游戏推荐
          </Title>
          <Text style={{ color: textSecondary }}>
            告诉我你喜欢什么类型的游戏，AI会为你推荐
          </Text>
        </div>
        <Button icon={<PlusOutlined />} onClick={createSession}>新对话</Button>
      </div>

      {/* 消息列表 */}
      <Card
        style={{ flex: 1, overflow: 'auto', background: cardBg, marginBottom: 16 }}
        styles={{ body: { height: '100%', overflow: 'auto', padding: '16px' } }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: textSecondary }}>
            <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>开始对话，告诉我你喜欢什么游戏</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              例如: "推荐一些开放世界的RPG游戏" / "我喜欢玩《塞尔达》，还有哪些类似的作品？"
            </p>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', border: 'none', padding: '8px 0' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {msg.role === 'assistant' ? <Avatar icon={<RobotOutlined />} size="small" style={{ background: '#ff4757' }} /> : null}
                    <Text strong style={{ color: textSecondary, fontSize: 12 }}>
                      {msg.role === 'user' ? '你' : 'AI 助手'}
                    </Text>
                  </div>
                  <Card
                    size="small"
                    style={{
                      background: msg.role === 'user' ? '#ff4757' : cardBg,
                      color: msg.role === 'user' ? (isDark ? '#fff' : '#000') : textColor,
                      border: msg.role === 'user' ? 'none' : (isDark ? '1px solid #333' : '1px solid #e8e8e8')
                    }}
                    styles={{ body: { padding: '12px' } }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>

                    {/* AI 推荐的游戏卡片 */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong style={{ color: textColor, display: 'block', marginBottom: 8 }}>
                          为你推荐的游戏:
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {msg.recommendations.map((game, idx) => (
                            <Tag
                              key={idx}
                              style={{ cursor: 'pointer', padding: '4px 8px' }}
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
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Spin tip="AI正在思考中..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* 输入区域 */}
      <Card style={{ background: cardBg }} styles={{ body: { padding: '12px 16px' } }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <TextArea
            placeholder="输入你的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              flex: 1,
              background: inputBg,
              borderRadius: 8,
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
            style={{ borderRadius: 8 }}
          />
          <Button
            icon={<ClearOutlined />}
            onClick={clearMessages}
            style={{ borderRadius: 8 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Chat;