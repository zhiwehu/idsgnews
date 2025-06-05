import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Spin, Typography, message, Button } from 'antd';
import { ClockCircleOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';
import type { NewsItem } from '../types';

const { Title, Paragraph, Text } = Typography;



const HomePage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 使用NewsService加载数据
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // 获取数据源信息
        const status = newsService.getStatus();
        console.log('当前数据源状态:', status);
        
        // 加载新闻数据
        const newsData = await newsService.loadNews();
        setNews(newsData);
        
        if (newsData.length > 0) {
          message.success(`成功从 ${status.dataSource} 加载了 ${newsData.length} 条新闻`);
        } else {
          message.warning('未获取到新闻数据');
        }
      } catch (error) {
        console.error('获取新闻失败:', error);
        message.error('获取新闻数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
      <Spin spinning={loading} size="large">
        <List
          grid={{ 
            gutter: [32, 32], 
            xs: 1, 
            sm: 1, 
            md: 2, 
            lg: 3, 
            xl: 3, 
            xxl: 3 
          }}
          dataSource={news}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/news/${item.id}`)}
                style={{
                   borderRadius: '16px',
                   overflow: 'hidden',
                   border: '1px solid #e8e8e8',
                   background: '#fff',
                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                   transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                   minHeight: '400px',
                   display: 'flex',
                   flexDirection: 'column'
                 }}
                bodyStyle={{ padding: '28px' }}
                cover={
                  item.imageUrl && (
                    <div style={{ 
                       height: '200px', 
                       overflow: 'hidden',
                       position: 'relative'
                     }}>
                      <img 
                         alt={item.title} 
                         src={item.imageUrl} 
                         style={{ 
                           width: '100%', 
                           height: '100%', 
                           objectFit: 'cover'
                         }}
                       />
                      <div style={{
                         position: 'absolute',
                         top: '12px',
                         right: '12px',
                         background: '#1890ff',
                         borderRadius: '12px',
                         padding: '4px 12px',
                         color: '#fff',
                         fontSize: '12px',
                         fontWeight: '600'
                       }}>
                         <EyeOutlined style={{ marginRight: '4px' }} />
                         HOT
                       </div>
                    </div>
                  )
                }
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  justifyContent: 'space-between'
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Title 
                       level={4} 
                       style={{ 
                         margin: '0 0 12px 0',
                         fontSize: '18px',
                         lineHeight: '1.4',
                         fontWeight: '600',
                         color: '#262626'
                       }}
                     >
                       {item.title}
                     </Title>
                  
                    <Paragraph 
                      ellipsis={{ rows: 3 }} 
                      style={{ 
                        color: '#666',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        marginBottom: '16px',
                        flex: 1
                      }}
                    >
                      {item.title} - 来自 {item.source} 的最新AI资讯报道
                    </Paragraph>
                  
                    <div style={{ marginBottom: '16px' }}>
                       {item.tags.map((tag) => (
                         <Tag 
                           key={tag} 
                           color="blue"
                           style={{
                             margin: '0 4px 4px 0',
                             borderRadius: '4px'
                           }}
                         >
                           {tag}
                         </Tag>
                       ))}
                     </div>
                  </div>
                  
                  <div style={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center',
                     paddingTop: '16px',
                     borderTop: '1px solid #f0f0f0',
                     marginTop: 'auto'
                   }}>
                    <div>
                      <Text style={{ color: '#999', fontSize: '12px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
                      </Text>
                      <br />
                      <Text style={{ color: '#999', fontSize: '12px' }}>
                        来源：{item.source}
                      </Text>
                    </div>
                    <Button 
                       type="primary" 
                       size="small"
                       icon={<LinkOutlined />}
                       onClick={(e) => {
                         e.stopPropagation();
                         window.open(item.link, '_blank');
                       }}
                     >
                       阅读更多
                     </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Spin>
  );
};

export default HomePage;