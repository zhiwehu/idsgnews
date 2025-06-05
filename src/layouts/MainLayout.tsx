import React from 'react';
import { Layout, Menu } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            onClick={() => navigate('/')}
            style={{ 
              height: '32px', 
              marginRight: '12px',
              cursor: 'pointer'
            }} 
          />
          <h1 style={{ 
            color: '#fff', 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #fff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI新闻动态
          </h1>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ 
            background: 'transparent', 
            border: 'none',
            color: '#fff'
          }}
          theme="dark"
          items={[
            {
              key: '/',
              icon: <HomeOutlined />,
              label: <Link to="/" style={{ color: '#fff' }}>首页</Link>,
            },
          ]}
        />
      </Header>
      <Content style={{ 
        padding: '24px',
        background: 'transparent'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px'
        }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;