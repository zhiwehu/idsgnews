import type { NewsItem } from '../types';
import initSqlJs from 'sql.js';

/**
 * 从SQLite数据库加载新闻数据
 * @returns Promise<NewsItem[]> 新闻数据数组
 */
export const loadFromSqlite = async (): Promise<NewsItem[]> => {
  try {
    console.log('正在从SQLite数据库加载数据...');
    
    // 初始化sql.js
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // 读取数据库文件
    const dbPath = '/news.db'; // 从public目录读取
    const response = await fetch(dbPath);
    
    if (!response.ok) {
      throw new Error(`无法读取数据库文件: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 打开数据库
    const db = new SQL.Database(uint8Array);
    
    // 查询所有新闻数据
    const stmt = db.prepare('SELECT * FROM news ORDER BY publishedAt DESC');
    const rows: any[] = [];
    
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    stmt.free();
    db.close();
    
    // 转换数据格式
    const newsItems: NewsItem[] = rows.map(row => ({
      id: row.id as number,
      title: row.title as string,
      source: row.source as string || '',
      link: row.link as string,
      publishedAt: row.publishedAt as string,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      imageUrl: row.imageUrl as string || '',
      content: row.content as string || ''
    }));
    
    console.log(`成功从SQLite加载 ${newsItems.length} 条新闻数据`);
    return newsItems;
    
    /* 实际SQLite实现示例：
    const db = new Database(import.meta.env.VITE_DB_PATH);
    const stmt = db.prepare('SELECT * FROM news ORDER BY publishedAt DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      source: row.source,
      link: row.link,
      publishedAt: row.published_at,
      tags: JSON.parse(row.tags),
      imageUrl: row.image_url,
      content: row.content
    }));
    */
    
  } catch (error) {
    console.error('从SQLite加载数据失败:', error);
    return [];
  }
};

/**
 * 从SQLite获取单条新闻数据
 * @param id 新闻ID
 * @returns Promise<NewsItem | null> 新闻数据或null
 */
export const getNewsByIdFromSqlite = async (id: number): Promise<NewsItem | null> => {
  try {
    console.log(`正在从SQLite获取新闻ID: ${id}`);
    
    // 初始化sql.js
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // 读取数据库文件
    const dbPath = '/news.db'; // 从public目录读取
    const response = await fetch(dbPath);
    
    if (!response.ok) {
      throw new Error(`无法读取数据库文件: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 打开数据库
    const db = new SQL.Database(uint8Array);
    
    // 查询指定ID的新闻数据
    const stmt = db.prepare('SELECT * FROM news WHERE id = ?');
    stmt.bind([id]);
    
    let newsItem: NewsItem | null = null;
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      newsItem = {
        id: row.id as number,
        title: row.title as string,
        source: row.source as string || '',
        link: row.link as string,
        publishedAt: row.publishedAt as string,
        tags: row.tags ? JSON.parse(row.tags as string) : [],
        imageUrl: row.imageUrl as string || '',
        content: row.content as string || ''
      };
    }
    
    stmt.free();
    db.close();
    
    return newsItem;
  } catch (error) {
    console.error('从SQLite获取新闻详情失败:', error);
    return null;
  }
};

/**
 * 向SQLite数据库插入新闻数据
 * @param news 新闻数据
 * @returns Promise<boolean> 是否插入成功
 */
export const insertNewsToSqlite = async (news: Omit<NewsItem, 'id'>): Promise<boolean> => {
  try {
    console.log('向SQLite数据库插入新闻:', news.title);
    
    // 模拟插入操作
    await new Promise(resolve => setTimeout(resolve, 300));
    
    /* 实际SQLite实现：
    const db = new Database(import.meta.env.VITE_DB_PATH);
    const stmt = db.prepare(`
      INSERT INTO news (title, source, link, published_at, tags, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      news.title,
      news.source,
      news.link,
      news.publishedAt,
      JSON.stringify(news.tags),
      news.imageUrl
    );
    
    return result.changes > 0;
    */
    
    return true;
  } catch (error) {
    console.error('向SQLite插入数据失败:', error);
    return false;
  }
};