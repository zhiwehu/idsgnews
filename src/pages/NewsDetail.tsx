import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Spin, message, Divider } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons';
import newsService from '../services/newsService';
import type { NewsItem } from '../types';

const { Title, Paragraph, Text } = Typography;

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) {
        message.error('新闻ID不存在');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const newsData = await newsService.loadNews();
        const newsItem = newsData.find(item => item.id === parseInt(id));
        
        if (newsItem) {
          setNews(newsItem);
        } else {
          message.error('未找到该新闻');
          navigate('/');
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error);
        message.error('获取新闻详情失败');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return null;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{
          marginBottom: '24px',
          fontSize: '16px',
          height: 'auto',
          padding: '8px 16px',
          color: '#667eea',
          fontWeight: '600'
        }}
      >
        返回首页
      </Button>

      <Card
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '2px solid transparent',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.15),
            0 12px 40px rgba(102, 126, 234, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 0 0 1px rgba(102, 126, 234, 0.1)
          `
        }}
        bodyStyle={{ padding: '40px' }}
        cover={
          news.imageUrl && (
            <div style={{ 
              height: '400px', 
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
            }}>
              <img 
                alt={news.title} 
                src={news.imageUrl} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'brightness(1.1) contrast(1.15) saturate(1.1)'
                }}
              />
              {/* 热门标签 */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
                borderRadius: '30px',
                padding: '8px 18px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '700',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }}>
                <EyeOutlined style={{ marginRight: '8px' }} />
                HOT
              </div>
            </div>
          )
        }
      >
        <div style={{ marginBottom: '24px' }}>
          <Title 
            level={1} 
            style={{ 
              margin: '0 0 24px 0',
              fontSize: '32px',
              lineHeight: '1.3',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 50%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            {news.title}
          </Title>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px',
            marginBottom: '24px',
            padding: '16px 0',
            borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Text style={{ color: '#999', fontSize: '14px' }}>
              <ClockCircleOutlined style={{ marginRight: '8px' }} />
              {new Date(news.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={{ color: '#999', fontSize: '14px' }}>
              来源：{news.source}
            </Text>
          </div>

          <div style={{ marginBottom: '32px' }}>
            {news.tags.map((tag, index) => (
              <Tag 
                key={tag} 
                style={{
                  background: `linear-gradient(135deg, hsl(${240 + index * 40}, 75%, 65%), hsl(${280 + index * 40}, 75%, 70%))`,
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  margin: '0 12px 12px 0',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '32px 0' }} />

        <div style={{ marginBottom: '32px' }}>
          <Paragraph 
            style={{ 
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#444',
              textAlign: 'justify'
            }}
          >
            {news.content || `${news.title} - 这是一篇来自 ${news.source} 的最新AI科技资讯报道。本文详细介绍了相关技术发展动态，为读者提供了深入的行业洞察和分析。通过专业的视角和详实的数据，帮助读者更好地理解当前AI技术的发展趋势和未来前景。`}
          </Paragraph>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '32px',
          borderTop: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Button 
            type="primary" 
            size="large"
            icon={<LinkOutlined />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '30px',
              padding: '16px 32px',
              height: 'auto',
              fontSize: '16px',
              fontWeight: '700',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onClick={() => window.open(news.link, '_blank')}
          >
            阅读原文
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewsDetail;