# 智谱清言AI搜索API设置指南

## 概述

智谱清言是由清华大学和智谱AI开发的大语言模型，提供强大的AI搜索功能。本指南将帮助您配置智谱清言API来抓取新闻数据。

## 获取API密钥

1. 访问智谱清言开放平台：https://open.bigmodel.cn/
2. 注册账号并登录
3. 在控制台中创建API密钥
4. 复制生成的API密钥

## 配置方法

### 方法1：使用环境变量（推荐）

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，设置智谱清言API密钥：
   ```bash
   ZHIPU_API_KEY=your_actual_api_key_here
   ```

3. 在运行脚本前加载环境变量：
   ```bash
   # Windows (PowerShell)
   Get-Content .env | ForEach-Object { $name, $value = $_.split('='); Set-Item -Path "env:$name" -Value $value }
   
   # Windows (Command Prompt)
   for /f "tokens=1,2 delims==" %i in (.env) do set %i=%j
   
   # Linux/macOS
   export $(cat .env | xargs)
   ```

### 方法2：使用settings.json文件

编辑 `settings.json` 文件：
```json
{
  "apiProvider": "zhipu",
  "apiKey": "your_actual_api_key_here",
  "keywords": "AI,人工智能,机器学习,深度学习",
  "maxResults": 20,
  "storageType": "json"
}
```

### 方法3：使用命令行参数

```bash
python news_scraper.py --api zhipu --api-key your_actual_api_key_here
```

## 使用示例

### 基本使用

```bash
# 使用默认设置（需要先配置环境变量）
python news_scraper.py

# 指定API提供商为智谱清言
python news_scraper.py --api zhipu

# 自定义关键词
python news_scraper.py --api zhipu --keywords "人工智能,ChatGPT,大模型"

# 保存为SQLite格式
python news_scraper.py --api zhipu --storage-type sqlite
```

### 高级使用

```bash
# 使用自定义设置文件
python news_scraper.py --settings my_settings.json --api zhipu

# 组合多个参数
python news_scraper.py --api zhipu --keywords "AI新闻,科技资讯" --storage-type json --api-key your_key
```

## API特点

- **智能搜索**：基于大语言模型的智能理解和搜索
- **中文优化**：对中文内容有更好的理解和处理能力
- **实时性**：能够获取最新的网络信息
- **准确性**：AI辅助的内容筛选和质量评估

## 注意事项

1. **API限制**：请注意智谱清言API的调用频率限制
2. **费用**：根据使用量可能产生费用，请查看官方定价
3. **网络**：确保网络连接稳定，API调用可能需要较长时间
4. **备用方案**：如果API调用失败，脚本会自动返回模拟数据

## 故障排除

### 常见错误

1. **401 Unauthorized**
   - 检查API密钥是否正确
   - 确认API密钥是否已激活

2. **429 Too Many Requests**
   - 降低请求频率
   - 检查API配额是否用完

3. **网络超时**
   - 检查网络连接
   - 增加超时时间设置

### 调试模式

运行脚本时可以查看详细日志：
```bash
python news_scraper.py --api zhipu
```

日志文件会保存在 `scraper.log` 中，包含详细的API调用信息。

## 支持

如果遇到问题，请：
1. 查看 `scraper.log` 日志文件
2. 检查智谱清言官方文档
3. 确认API密钥和网络设置