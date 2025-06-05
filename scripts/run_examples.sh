#!/bin/bash

# 新闻抓取脚本使用示例

echo "=== 新闻抓取脚本使用示例 ==="

# 1. 基本使用（使用默认设置）
echo "1. 基本使用（使用默认设置）"
echo "python news_scraper.py"
echo ""

# 2. 使用自定义关键词
echo "2. 使用自定义关键词"
echo "python news_scraper.py -k 'Python,JavaScript,React,Vue'"
echo ""

# 3. 保存到SQLite数据库
echo "3. 保存到SQLite数据库"
echo "python news_scraper.py -t sqlite"
echo ""

# 4. 使用Bing API
echo "4. 使用Bing API（需要API密钥）"
echo "python news_scraper.py -a bing --api-key 'your-bing-api-key'"
echo ""

# 5. 使用Brave Search API
echo "5. 使用Brave Search API（需要API密钥）"
echo "python news_scraper.py -a brave --api-key 'your-brave-api-key'"
echo ""

# 6. 组合使用多个参数
echo "6. 组合使用多个参数"
echo "python news_scraper.py -k 'AI,机器学习,深度学习' -t json -a brave --api-key 'your-api-key'"
echo ""

# 7. 使用自定义设置文件
echo "7. 使用自定义设置文件"
echo "python news_scraper.py -s custom_settings.json"
echo ""

echo "=== 注意事项 ==="
echo "1. 首次运行前请安装依赖：pip install -r requirements.txt"
echo "2. 请在settings.json中配置API密钥"
echo "3. 确保有网络连接以访问API"
echo "4. 数据将保存到../data/目录下"
echo ""

echo "=== 查看帮助 ==="
echo "python news_scraper.py --help"