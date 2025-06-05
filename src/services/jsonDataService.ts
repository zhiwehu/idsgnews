import type { NewsItem } from '../types';

/**
 * 从JSON文件加载新闻数据
 * @returns Promise<NewsItem[]> 新闻数据数组
 */
export const loadFromJson = async (): Promise<NewsItem[]> => {
  try {
    // 在开发环境中，需要从public目录或使用import
    // 这里我们直接导入JSON数据
    const newsData = await import('../data/news.json');
    const data: NewsItem[] = newsData.default;
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return data;
  } catch (error) {
    console.error('加载JSON数据失败:', error);
    // 返回空数组作为fallback
    return [];
  }
};

/**
 * 获取单条新闻数据
 * @param id 新闻ID
 * @returns Promise<NewsItem | null> 新闻数据或null
 */
export const getNewsById = async (id: number): Promise<NewsItem | null> => {
  try {
    const allNews = await loadFromJson();
    return allNews.find(news => news.id === id) || null;
  } catch (error) {
    console.error('获取新闻详情失败:', error);
    return null;
  }
};

/**
 * 根据标签筛选新闻
 * @param tag 标签名称
 * @returns Promise<NewsItem[]> 筛选后的新闻数组
 */
export const getNewsByTag = async (tag: string): Promise<NewsItem[]> => {
  try {
    const allNews = await loadFromJson();
    return allNews.filter(news => news.tags.includes(tag));
  } catch (error) {
    console.error('按标签筛选新闻失败:', error);
    return [];
  }
};