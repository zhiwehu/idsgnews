# AI新闻网站 - 混合数据存储方案

## 概述

本项目实现了一个灵活的混合数据存储方案，支持根据环境自动切换数据源，提供开发和生产环境的不同数据存储策略。

## 数据源类型

### 1. JSON文件存储 (开发环境)
- **适用场景**: 开发、测试、原型设计
- **优点**: 简单易用，无需数据库配置，便于调试
- **数据文件**: `src/data/news.json`
- **特点**: 静态数据，支持快速迭代

### 2. SQLite数据库 (生产环境)
- **适用场景**: 生产部署，数据持久化
- **优点**: 支持复杂查询，数据完整性，事务支持
- **数据库文件**: `./data/news.db`
- **特点**: 动态数据，支持增删改查

## 环境配置

### 开发环境 (.env.development)
```env
VITE_DATA_SOURCE=json
VITE_DB_PATH=./data/news.db
```

### 生产环境 (.env.production)
```env
VITE_DATA_SOURCE=sqlite
VITE_DB_PATH=./data/news.db
```

## 项目结构

```
src/
├── data/
│   └── news.json              # JSON数据文件
├── services/
│   ├── newsService.ts         # 核心数据服务（单例）
│   ├── jsonDataService.ts     # JSON数据操作
│   └── sqliteDataService.ts   # SQLite数据操作
└── pages/
    └── Home.tsx              # 使用数据服务的页面
```

## 使用方法

### 1. 基本使用

```typescript
import newsService from '../services/newsService';

// 获取所有新闻
const news = await newsService.loadNews();

// 获取单条新闻
const newsItem = await newsService.getNewsById(1);

// 按标签筛选
const taggedNews = await newsService.getNewsByTag('AI');

// 获取当前数据源状态
const status = newsService.getStatus();
```

### 2. 数据源切换

```typescript
// 动态切换数据源（用于测试）
newsService.switchDataSource('sqlite');
```

### 3. 添加新闻（仅SQLite）

```typescript
const newNews = {
  title: '新的AI突破',
  source: 'Tech News',
  link: 'https://example.com',
  publishedAt: new Date().toISOString(),
  tags: ['AI', '突破'],
  imageUrl: 'https://example.com/image.jpg'
};

const success = await newsService.addNews(newNews);
```

## 环境切换

### 开发模式
```bash
npm run dev
# 自动使用 .env.development 配置
# 数据源: JSON文件
```

### 生产构建
```bash
npm run build
# 使用 .env.production 配置
# 数据源: SQLite数据库
```

## 数据服务特性

### 1. 自动回退机制
- 当主数据源失败时，自动回退到JSON数据源
- 确保应用的可用性和稳定性

### 2. 错误处理
- 完善的错误捕获和日志记录
- 用户友好的错误提示

### 3. 性能优化
- 模拟网络延迟，真实反映加载状态
- 支持异步加载和状态管理

### 4. 类型安全
- 完整的TypeScript类型定义
- 统一的数据接口规范

## 扩展SQLite功能

要在生产环境中使用真实的SQLite数据库，需要：

1. **安装SQLite依赖**:
```bash
npm install better-sqlite3
npm install @types/better-sqlite3 --save-dev
```

2. **创建数据库表**:
```sql
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  link TEXT NOT NULL,
  published_at TEXT NOT NULL,
  tags TEXT NOT NULL,
  image_url TEXT
);
```

3. **取消注释SQLite服务中的实际实现代码**

## 部署注意事项

1. **环境变量**: 确保生产环境正确配置环境变量
2. **数据库文件**: 确保SQLite数据库文件路径可访问
3. **权限设置**: 确保应用有读写数据库文件的权限
4. **备份策略**: 定期备份SQLite数据库文件

## 监控和调试

- 查看浏览器控制台获取数据源状态信息
- 使用 `newsService.getStatus()` 获取当前配置
- 检查网络请求和错误日志

## 最佳实践

1. **开发阶段**: 使用JSON文件快速迭代
2. **测试阶段**: 测试两种数据源的切换
3. **生产部署**: 使用SQLite确保数据持久化
4. **数据迁移**: 提供JSON到SQLite的数据迁移工具