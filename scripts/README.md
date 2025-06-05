# 新闻数据抓取脚本

这个Python脚本用于抓取新闻数据，支持多种API提供商和存储格式。

## 功能特性

- 支持多个搜索API：Brave Search、Bing News、百度（模拟）
- 支持多种存储格式：JSON文件、SQLite数据库
- 可配置的关键词搜索
- 自动去重和标签合并
- 详细的日志记录
- 命令行参数支持

## 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

## 配置设置

编辑 `settings.json` 文件来配置抓取参数：

```json
{
  "keywords": "AI,人工智能,机器学习,深度学习,ChatGPT,OpenAI,科技新闻",
  "updateTime": "09:00",
  "apiKey": "your-api-key-here",
  "apiProvider": "brave",
  "storageType": "json",
  "maxResults": 20,
  "dbPath": "../data/news.db",
  "jsonPath": "../data/news.json"
}
```

### 配置说明

- `keywords`: 搜索关键词，用逗号分隔
- `updateTime`: 更新时间（暂未使用）
- `apiKey`: API密钥（Brave Search或Bing需要）
- `apiProvider`: API提供商（brave/bing/baidu）
- `storageType`: 存储类型（json/sqlite）
- `maxResults`: 每个关键词的最大结果数
- `dbPath`: SQLite数据库文件路径
- `jsonPath`: JSON文件路径

## API密钥获取

### Brave Search API
1. 访问 [Brave Search API](https://api.search.brave.com/)
2. 注册账户并获取API密钥
3. 将密钥填入 `settings.json` 的 `apiKey` 字段

### Bing News Search API
1. 访问 [Microsoft Azure](https://azure.microsoft.com/)
2. 创建认知服务资源
3. 获取Bing Search API密钥
4. 将密钥填入 `settings.json` 的 `apiKey` 字段

## 使用方法

### 基本使用

```bash
python news_scraper.py
```

### 命令行参数

```bash
# 指定设置文件
python news_scraper.py -s custom_settings.json

# 覆盖关键词
python news_scraper.py -k "Python,JavaScript,React"

# 指定存储类型
python news_scraper.py -t sqlite

# 指定API提供商
python news_scraper.py -a bing

# 指定API密钥
python news_scraper.py --api-key "your-api-key"

# 组合使用
python news_scraper.py -k "AI新闻" -t json -a brave --api-key "your-key"
```

### 参数说明

- `-s, --settings`: 设置文件路径
- `-k, --keywords`: 搜索关键词（逗号分隔）
- `-t, --storage-type`: 存储类型（json或sqlite）
- `-a, --api`: API提供商（brave、bing或baidu）
- `--api-key`: API密钥

## 输出格式

### JSON格式

新闻数据将保存到指定的JSON文件中，格式如下：

```json
[
  {
    "id": 1,
    "title": "新闻标题",
    "source": "新闻来源",
    "link": "https://example.com/news/1",
    "publishedAt": "2024-01-01T12:00:00",
    "tags": ["AI", "科技"],
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

### SQLite格式

数据将保存到SQLite数据库的 `news` 表中，包含以下字段：

- `id`: 自增主键
- `title`: 新闻标题
- `source`: 新闻来源
- `link`: 新闻链接（唯一）
- `publishedAt`: 发布时间
- `tags`: 标签（JSON格式）
- `imageUrl`: 图片URL

## 日志记录

脚本会生成详细的日志记录：
- 控制台输出：实时显示运行状态
- 日志文件：`scraper.log` 保存完整的运行日志

## 注意事项

1. **API限制**：不同的API提供商有不同的调用限制，请注意控制调用频率
2. **数据去重**：脚本会自动根据链接去重，相同链接的新闻会合并标签
3. **网络连接**：确保网络连接正常，API调用需要访问外网
4. **文件权限**：确保脚本有权限创建和写入数据文件

## 定时任务

可以使用cron（Linux/macOS）或任务计划程序（Windows）来定时运行脚本：

```bash
# 每天上午9点运行
0 9 * * * cd /path/to/scripts && python news_scraper.py
```

## 故障排除

1. **API密钥错误**：检查API密钥是否正确设置
2. **网络连接问题**：检查网络连接和防火墙设置
3. **文件权限问题**：确保有权限创建和写入文件
4. **依赖包问题**：确保所有依赖包已正确安装

## 扩展功能

脚本设计为可扩展的，你可以：

1. 添加新的API提供商
2. 实现新的存储格式
3. 添加数据处理和过滤功能
4. 集成到现有的新闻系统中

## 许可证

本脚本仅供学习和研究使用，请遵守相关API的使用条款。