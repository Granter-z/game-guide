import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login, register } from '../services/api';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await login(values);
      setToken(res.data.token);
      setUser(res.data.user);
      message.success('登录成功');
      navigate('/profile');
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次密码输入不一致');
      return;
    }
    try {
      setLoading(true);
      const res = await register({
        username: values.username,
        email: values.email,
        password: values.password
      });
      setToken(res.data.token);
      setUser(res.data.user);
      message.success('注册成功');
      navigate('/profile');
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = () => (
    <Form onFinish={handleLogin} layout="vertical" className="max-w-md mx-auto">
      <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
        <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form onFinish={handleRegister} layout="vertical" className="max-w-md mx-auto">
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
      </Form.Item>
      <Form.Item name="email" rules={[
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效邮箱' }
      ]}>
        <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
      </Form.Item>
      <Form.Item name="confirmPassword" rules={[{ required: true, message: '请确认密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <Tabs
          defaultActiveKey="login"
          items={[
            { key: 'login', label: '登录', children: <LoginForm /> },
            { key: 'register', label: '注册', children: <RegisterForm /> }
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;