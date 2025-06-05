import type { NewsItem } from '../types';
import { loadFromJson, getNewsById as getNewsByIdFromJson, getNewsByTag as getNewsByTagFromJson } from './jsonDataService';
import { loadFromSqlite, getNewsByIdFromSqlite, insertNewsToSqlite } from './sqliteDataService';

/**
 * 数据源类型
 */
type DataSource = 'json' | 'sqlite';

/**
 * 新闻服务类 - 根据环境配置动态选择数据源
 */
class NewsService {
  private dataSource: DataSource;
  private dbPath: string;

  constructor() {
    // 从环境变量获取数据源配置
    this.dataSource = (import.meta.env.VITE_DATA_SOURCE as DataSource) || 'json';
    this.dbPath = import.meta.env.VITE_DB_PATH || './data/news.db';
    
    console.log(`新闻服务初始化 - 数据源: ${this.dataSource}, 数据库路径: ${this.dbPath}`);
  }

  /**
   * 获取当前数据源类型
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * 获取数据库路径
   */
  getDbPath(): string {
    return this.dbPath;
  }

  /**
   * 加载所有新闻数据
   * @returns Promise<NewsItem[]> 新闻数据数组
   */
  async loadNews(): Promise<NewsItem[]> {
    try {
      console.log(`正在从 ${this.dataSource} 加载新闻数据...`);
      
      switch (this.dataSource) {
        case 'json':
          return await loadFromJson();
        case 'sqlite':
          return await loadFromSqlite();
        default:
          console.warn(`未知的数据源类型: ${this.dataSource}，回退到JSON`);
          return await loadFromJson();
      }
    } catch (error) {
      console.error('加载新闻数据失败:', error);
      // 如果当前数据源失败，尝试回退到JSON
      if (this.dataSource !== 'json') {
        console.log('尝试回退到JSON数据源...');
        try {
          return await loadFromJson();
        } catch (fallbackError) {
          console.error('JSON回退也失败:', fallbackError);
        }
      }
      return [];
    }
  }

  /**
   * 根据ID获取单条新闻
   * @param id 新闻ID
   * @returns Promise<NewsItem | null> 新闻数据或null
   */
  async getNewsById(id: number): Promise<NewsItem | null> {
    try {
      switch (this.dataSource) {
        case 'json':
          return await getNewsByIdFromJson(id);
        case 'sqlite':
          return await getNewsByIdFromSqlite(id);
        default:
          return await getNewsByIdFromJson(id);
      }
    } catch (error) {
      console.error(`获取新闻详情失败 (ID: ${id}):`, error);
      return null;
    }
  }

  /**
   * 根据标签筛选新闻
   * @param tag 标签名称
   * @returns Promise<NewsItem[]> 筛选后的新闻数组
   */
  async getNewsByTag(tag: string): Promise<NewsItem[]> {
    try {
      switch (this.dataSource) {
        case 'json':
          return await getNewsByTagFromJson(tag);
        case 'sqlite': {
          // SQLite版本的按标签筛选需要单独实现
          const allNews = await loadFromSqlite();
          return allNews.filter(news => news.tags.includes(tag));
        }
        default:
          return await getNewsByTagFromJson(tag);
      }
    } catch (error) {
      console.error(`按标签筛选新闻失败 (标签: ${tag}):`, error);
      return [];
    }
  }

  /**
   * 添加新闻数据（仅SQLite支持）
   * @param news 新闻数据（不包含ID）
   * @returns Promise<boolean> 是否添加成功
   */
  async addNews(news: Omit<NewsItem, 'id'>): Promise<boolean> {
    if (this.dataSource !== 'sqlite') {
      console.warn('添加新闻功能仅在SQLite数据源下支持');
      return false;
    }

    try {
      return await insertNewsToSqlite(news);
    } catch (error) {
      console.error('添加新闻失败:', error);
      return false;
    }
  }

  /**
   * 切换数据源（用于测试或动态切换）
   * @param newDataSource 新的数据源类型
   */
  switchDataSource(newDataSource: DataSource): void {
    console.log(`数据源从 ${this.dataSource} 切换到 ${newDataSource}`);
    this.dataSource = newDataSource;
  }

  /**
   * 获取数据源状态信息
   * @returns 数据源状态对象
   */
  getStatus() {
    return {
      dataSource: this.dataSource,
      dbPath: this.dbPath,
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    };
  }
}

// 创建单例实例
const newsService = new NewsService();

// 导出单例实例
export default newsService;

// 也可以导出类，用于测试或特殊场景
export { NewsService };