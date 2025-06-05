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
                className="tech-news-card"
                onClick={() => navigate(`/news/${item.id}`)}
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
                   `,
                   transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                   position: 'relative',
                   transform: 'translateZ(0)',
                   minHeight: '520px',
                   display: 'flex',
                   flexDirection: 'column'
                 }}
                bodyStyle={{ padding: '28px' }}
                cover={
                  item.imageUrl && (
                    <div className="tech-image-container" style={{ 
                       height: '240px', 
                       overflow: 'hidden',
                       position: 'relative',
                       background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
                     }}>
                      <img 
                         alt={item.title} 
                         src={item.imageUrl} 
                         className="tech-image"
                         style={{ 
                           width: '100%', 
                           height: '100%', 
                           objectFit: 'cover',
                           transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                           filter: 'brightness(1.1) contrast(1.15) saturate(1.1)'
                         }}
                       />
                      {/* 科技感边框动画 */}
                      <div className="tech-border-animation" style={{
                         position: 'absolute',
                         top: '12px',
                         left: '12px',
                         right: '12px',
                         bottom: '12px',
                         border: '2px solid transparent',
                         borderRadius: '16px',
                         background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c) border-box',
                         mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                         maskComposite: 'exclude',
                         opacity: 0,
                         transition: 'opacity 0.6s ease',
                         animation: 'borderGlow 3s ease-in-out infinite alternate'
                       }} />
                      {/* 热门标签 */}
                      <div className="tech-hot-badge" style={{
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
                         boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                         transform: 'translateZ(0)',
                         animation: 'pulse 2s ease-in-out infinite'
                       }}>
                         <EyeOutlined style={{ marginRight: '8px' }} />
                         HOT
                       </div>
                       {/* 渐变遮罩 */}
                       <div style={{
                         position: 'absolute',
                         bottom: 0,
                         left: 0,
                         right: 0,
                         height: '80px',
                         background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.4))'
                       }} />
                       {/* 科技网格效果 */}
                       <div className="tech-grid" style={{
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 0,
                         backgroundImage: `
                           linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px)
                         `,
                         backgroundSize: '20px 20px',
                         opacity: 0,
                         transition: 'opacity 0.6s ease'
                       }} />
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
                       className="tech-title"
                       style={{ 
                         margin: '0 0 18px 0',
                         fontSize: '22px',
                         lineHeight: '1.3',
                         fontWeight: '800',
                         background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 50%, #764ba2 100%)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent',
                         backgroundSize: '200% 200%',
                         animation: 'gradientShift 4s ease-in-out infinite',
                         minHeight: 'auto',
                         textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                         letterSpacing: '-0.5px'
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
                  
                    <div style={{ marginBottom: '20px' }}>
                       {item.tags.map((tag, index) => (
                         <Tag 
                           key={tag} 
                           className="tech-tag"
                           style={{
                             background: `linear-gradient(135deg, hsl(${240 + index * 40}, 75%, 65%), hsl(${280 + index * 40}, 75%, 70%))`,
                             color: '#fff',
                             border: '1px solid rgba(255, 255, 255, 0.2)',
                             borderRadius: '20px',
                             padding: '6px 16px',
                             fontSize: '13px',
                             fontWeight: '700',
                             margin: '0 8px 8px 0',
                             boxShadow: `
                               0 6px 20px rgba(102, 126, 234, 0.4),
                               inset 0 1px 0 rgba(255, 255, 255, 0.3)
                             `,
                             transform: 'translateZ(0)',
                             transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                             position: 'relative',
                             overflow: 'hidden',
                             textTransform: 'uppercase',
                             letterSpacing: '0.5px'
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                             e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'translateY(0) scale(1)';
                             e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
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
                     paddingTop: '20px',
                     borderTop: '1px solid rgba(102, 126, 234, 0.1)',
                     background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02))',
                     margin: '0 -24px -24px -24px',
                     padding: '20px 24px'
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
                       size="large"
                       icon={<LinkOutlined />}
                       className="tech-read-button"
                       style={{
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                         border: '2px solid rgba(255, 255, 255, 0.2)',
                         borderRadius: '30px',
                         padding: '12px 28px',
                         height: 'auto',
                         fontSize: '15px',
                         fontWeight: '700',
                         boxShadow: `
                           0 12px 35px rgba(102, 126, 234, 0.5),
                           inset 0 1px 0 rgba(255, 255, 255, 0.3)
                         `,
                         transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                         position: 'relative',
                         overflow: 'hidden',
                         textTransform: 'uppercase',
                         letterSpacing: '1px'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                         e.currentTarget.style.boxShadow = '0 16px 45px rgba(102, 126, 234, 0.7)';
                         e.currentTarget.style.background = 'linear-gradient(135deg, #5a6fd8 0%, #6a42a0 50%, #e084f0 100%)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0) scale(1)';
                         e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
                         e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
                       }}
                       onClick={(e) => {
                         e.stopPropagation();
                         window.open(item.link, '_blank');
                       }}
                     >
                       READ MORE
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