# NewsAPI.org 配置指南

本文档介绍如何配置和使用 NewsAPI.org 来获取AI和科技相关的新闻数据。

## 什么是 NewsAPI.org

NewsAPI.org 是一个强大的新闻聚合API服务，提供来自全球15万+新闻源的实时和历史新闻数据。相比聚合数据API，NewsAPI.org 具有以下优势：

- **更丰富的新闻源**：包含 TechCrunch、The Verge、Engadget、Ars Technica、Wired 等知名科技媒体
- **更精确的搜索**：支持布尔搜索和高级过滤
- **更好的数据质量**：提供完整的文章描述、图片和元数据
- **更稳定的服务**：国际化API，访问更稳定

## 获取 API 密钥

### 1. 注册账户

1. 访问 [NewsAPI.org](https://newsapi.org/)
2. 点击 "Get API Key" 按钮
3. 填写注册信息：
   - 姓名
   - 邮箱
   - 密码
   - 使用目的（选择 "Personal" 或 "Business"）

### 2. 获取免费 API 密钥

注册成功后，你将获得一个免费的API密钥，包含以下限制：

- **每月请求数**：1,000 次
- **每日请求数**：100 次
- **支持的端点**：所有端点
- **数据延迟**：实时数据

### 3. 升级到付费计划（可选）

如果需要更多请求量，可以升级到付费计划：

- **Developer Plan**：$449/月，50,000 次请求
- **Business Plan**：$999/月，200,000 次请求
- **Enterprise Plan**：自定义价格和请求量

## 配置步骤

### 1. 更新配置文件

编辑 `scripts/settings.json` 文件：

```json
{
  "keywords": "AI, artificial intelligence, machine learning, deep learning, neural networks, AI hardware, GPU, TPU",
  "updateTime": "09:00",
  "apiKey": "你的NewsAPI密钥",
  "apiProvider": "newsapi",
  "storageType": "sqlite",
  "maxResults": 20,
  "dbPath": "../data/news.db",
  "jsonPath": "../data/news.json"
}
```

### 2. 设置 API 密钥

将你从 NewsAPI.org 获得的API密钥替换 `apiKey` 字段的值。

### 3. 优化关键词

针对AI和科技新闻，建议使用以下关键词：

```
"AI, artificial intelligence, machine learning, deep learning, neural networks, AI hardware, GPU, TPU, computer vision, natural language processing, robotics, autonomous vehicles, AI chips"
```

## 使用方法

### 1. 基本使用

```bash
# 使用配置文件中的设置
python news_scraper.py

# 指定API提供商
python news_scraper.py --api newsapi

# 指定API密钥
python news_scraper.py --api newsapi --api-key "你的API密钥"
```

### 2. 自定义关键词

```bash
# 使用自定义关键词
python news_scraper.py --keywords "ChatGPT,GPT-4,OpenAI,Google AI,Microsoft AI"
```

### 3. 选择存储方式

```bash
# 保存为JSON文件
python news_scraper.py --storage-type json

# 保存为SQLite数据库
python news_scraper.py --storage-type sqlite
```

## API 特性

### 1. 支持的新闻源

NewsAPI.org 配置了以下优质科技媒体：

- **TechCrunch** - 创业和科技新闻
- **The Verge** - 科技、科学、艺术和文化
- **Engadget** - 消费电子和科技产品
- **Ars Technica** - 深度技术分析
- **Wired** - 科技对社会的影响
- **其他科技媒体** - 更多优质来源

### 2. 搜索功能

- **关键词搜索**：支持多个关键词组合
- **时间排序**：按发布时间排序，获取最新新闻
- **语言过滤**：主要获取英文新闻（质量更高）
- **去重处理**：自动过滤重复和被删除的文章

### 3. 数据字段

每条新闻包含以下信息：

- **标题**：文章标题
- **来源**：新闻媒体名称
- **链接**：原文链接
- **发布时间**：文章发布时间
- **标签**：自动生成的分类标签
- **图片**：文章配图URL
- **内容**：文章摘要或描述

## 故障排查

### 1. API 密钥错误

**错误信息**：`NewsAPI.org错误: apiKeyInvalid`

**解决方案**：
- 检查API密钥是否正确
- 确认API密钥是否已激活
- 检查账户是否被暂停

### 2. 请求限制

**错误信息**：`NewsAPI.org错误: rateLimited`

**解决方案**：
- 检查是否超过每日/每月请求限制
- 考虑升级到付费计划
- 减少抓取频率

### 3. 网络连接问题

**错误信息**：`NewsAPI.org调用失败: timeout`

**解决方案**：
- 检查网络连接
- 尝试使用代理
- 增加请求超时时间

### 4. 无新闻结果

**可能原因**：
- 关键词过于具体
- 时间范围限制
- 新闻源暂时无相关内容

**解决方案**：
- 调整关键词，使用更通用的术语
- 扩大时间范围
- 检查新闻源是否正常

## 最佳实践

### 1. 关键词优化

- 使用英文关键词，匹配度更高
- 组合使用通用词和专业词
- 定期更新关键词以跟上技术发展

### 2. 请求频率控制

- 避免频繁请求，遵守API限制
- 使用定时任务，如每2-4小时更新一次
- 监控API使用量，避免超限

### 3. 数据质量管理

- 定期清理重复数据
- 过滤低质量内容
- 验证链接有效性

## 与其他API的对比

| 特性 | NewsAPI.org | 聚合数据 | Bing News |
|------|-------------|----------|----------|
| 新闻源质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 搜索精度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 数据完整性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 访问稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 免费额度 | 1000次/月 | 100次/天 | 1000次/月 |
| 价格 | 中等 | 低 | 高 |

## 总结

NewsAPI.org 是获取高质量AI和科技新闻的理想选择。通过合理配置和使用，可以获得比聚合数据API更好的新闻内容和用户体验。

如有问题，请参考 [NewsAPI.org 官方文档](https://newsapi.org/docs) 或联系技术支持。