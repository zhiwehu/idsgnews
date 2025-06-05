#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
新闻数据抓取脚本

该脚本用于抓取新闻数据，并将其存储为JSON或SQLite格式。
使用方法：
    python news_scraper.py
"""

import os
import json
import sqlite3
import requests
import argparse
import logging
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("news_scraper")

# 定义新闻项类型
NewsItem = Dict[str, Any]


class NewsSettings:
    """新闻设置类，用于管理抓取配置"""
    
    def __init__(self, settings_file: str = "settings.json"):
        """初始化设置"""
        self.settings_file = settings_file
        self.settings = self._load_settings()
    
    def _load_settings(self) -> Dict[str, Any]:
        """加载设置文件"""
        default_settings = {
            "keywords": "AI,人工智能,机器学习,深度学习",
            "updateTime": "09:00",
            "apiKey": "",  # 需要用户提供API密钥
            "apiProvider": "brave",  # 默认使用Brave Search API
            "storageType": "json",  # 存储类型：json或sqlite
            "maxResults": 20,  # 每次抓取的最大结果数
            "dbPath": "../data/news.db",  # SQLite数据库路径
            "jsonPath": "../data/news.json"  # JSON文件路径
        }
        
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    loaded_settings = json.load(f)
                    # 合并默认设置和加载的设置
                    default_settings.update(loaded_settings)
                    logger.info(f"已加载设置文件: {self.settings_file}")
            else:
                # 如果设置文件不存在，创建默认设置文件
                self._save_settings(default_settings)
                logger.info(f"创建了默认设置文件: {self.settings_file}")
        except Exception as e:
            logger.error(f"加载设置文件失败: {e}")
        
        return default_settings
    
    def _save_settings(self, settings: Dict[str, Any]) -> None:
        """保存设置到文件"""
        try:
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)
            logger.info(f"设置已保存到: {self.settings_file}")
        except Exception as e:
            logger.error(f"保存设置失败: {e}")
    
    def get_setting(self, key: str) -> Any:
        """获取指定设置项"""
        return self.settings.get(key)
    
    def update_setting(self, key: str, value: Any) -> None:
        """更新设置项"""
        self.settings[key] = value
        self._save_settings(self.settings)
        logger.info(f"已更新设置: {key} = {value}")
    
    def get_keywords(self) -> List[str]:
        """获取关键词列表"""
        keywords_str = self.get_setting("keywords")
        return [kw.strip() for kw in keywords_str.split(",") if kw.strip()]


class NewsAPI:
    """新闻API接口类"""
    
    def __init__(self, settings: NewsSettings):
        """初始化API接口"""
        self.settings = settings
        self.api_provider = settings.get_setting("apiProvider")
        self.api_key = settings.get_setting("apiKey")
    
    def search_news(self, keyword: str) -> List[Dict[str, Any]]:
        """搜索新闻"""
        if self.api_provider == "brave":
            return self._search_brave(keyword)
        elif self.api_provider == "bing":
            return self._search_bing(keyword)
        elif self.api_provider == "baidu":
            return self._search_baidu(keyword)
        elif self.api_provider == "juhe":
            return self._search_juhe(keyword)
        elif self.api_provider == "newsapi":
            return self._search_newsapi(keyword)
        else:
            logger.error(f"不支持的API提供商: {self.api_provider}")
            return []
    
    def _search_brave(self, keyword: str) -> List[Dict[str, Any]]:
        """使用Brave Search API搜索"""
        try:
            url = "https://api.search.brave.com/res/v1/news/search"
            headers = {"Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": self.api_key}
            params = {"q": keyword, "count": self.settings.get_setting("maxResults")}
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            for item in data.get("results", []):
                news_item = {
                    "title": item.get("title", ""),
                    "source": item.get("source", ""),
                    "link": item.get("url", ""),
                    "publishedAt": item.get("published_time", datetime.now().isoformat()),
                    "tags": [keyword],  # 初始标签为搜索关键词
                    "imageUrl": item.get("thumbnail", {}).get("src", "https://via.placeholder.com/300x200/3b82f6/ffffff?text=News"),
                    "content": item.get("description", item.get("snippet", ""))  # 新闻内容摘要
                }
                results.append(news_item)
            
            return results
        except Exception as e:
            logger.error(f"Brave Search API 搜索失败: {e}")
            return []
    
    def _search_bing(self, keyword: str) -> List[Dict[str, Any]]:
        """使用Bing News Search API搜索"""
        try:
            url = "https://api.bing.microsoft.com/v7.0/news/search"
            headers = {"Ocp-Apim-Subscription-Key": self.api_key}
            params = {"q": keyword, "count": self.settings.get_setting("maxResults"), "mkt": "zh-CN"}
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            for item in data.get("value", []):
                news_item = {
                    "title": item.get("name", ""),
                    "source": item.get("provider", [{}])[0].get("name", ""),
                    "link": item.get("url", ""),
                    "publishedAt": item.get("datePublished", datetime.now().isoformat()),
                    "tags": [keyword],  # 初始标签为搜索关键词
                    "imageUrl": item.get("image", {}).get("thumbnail", {}).get("contentUrl", 
                                "https://via.placeholder.com/300x200/3b82f6/ffffff?text=News"),
                    "content": item.get("description", "")  # 新闻内容摘要
                }
                results.append(news_item)
            
            return results
        except Exception as e:
            logger.error(f"Bing News API 搜索失败: {e}")
            return []
    
    def _search_baidu(self, keyword: str) -> List[Dict[str, Any]]:
        """使用百度资讯搜索API（模拟）"""
        # 注意：百度没有官方新闻API，这里仅作为示例
        # 实际使用时可能需要使用网页爬虫或其他方法
        try:
            # 这里应该是实际的百度API调用
            # 由于没有官方API，这里返回模拟数据
            logger.warning("⚠️  百度搜索API为模拟实现，返回的是假数据！")
            logger.warning("⚠️  如需真实新闻数据，请参考 JUHE_API_SETUP.md 配置聚合数据API")
            
            results = []
            for i in range(5):  # 模拟5条结果
                news_item = {
                    "title": f"⚠️ [假数据] 关于{keyword}的模拟新闻 #{i+1}",
                    "source": "模拟数据源（非真实）",
                    "link": f"https://example.com/fake-news/{i}",
                    "publishedAt": datetime.now().isoformat(),
                    "tags": [keyword, "模拟数据"],
                    "imageUrl": "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=FAKE+DATA",
                    "content": f"⚠️ 这是模拟的假数据！关于{keyword}的虚假新闻内容。如需真实数据请配置聚合数据API。#{i+1}"
                }
                results.append(news_item)
            
            return results
        except Exception as e:
            logger.error(f"百度搜索失败: {e}")
            return []
    
    def _search_juhe(self, keyword: str) -> List[Dict[str, Any]]:
        """使用聚合数据新闻头条API"""
        try:
            # 聚合数据新闻头条API
            url = "http://v.juhe.cn/toutiao/index"
            params = {
                "type": "",  # 新闻类型，空为全部
                "key": self.api_key  # 聚合数据API密钥
            }
            
            if not self.api_key:
                logger.warning("聚合数据API密钥未配置，返回模拟数据")
                # 返回模拟数据作为备用
                results = []
                for i in range(5):
                    news_item = {
                        "title": f"[模拟] 关于{keyword}的新闻 #{i+1}",
                        "source": "模拟数据源",
                        "link": f"https://example.com/news/{i}",
                        "publishedAt": datetime.now().isoformat(),
                        "tags": [keyword],
                        "imageUrl": "https://via.placeholder.com/300x200/3b82f6/ffffff?text=Mock+News",
                        "content": f"这是关于{keyword}的模拟新闻内容摘要。这条新闻讨论了{keyword}领域的最新发展和趋势。#{i+1}"
                    }
                    results.append(news_item)
                return results
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("error_code") != 0:
                logger.error(f"聚合数据API错误: {data.get('reason', '未知错误')}")
                return []
            
            results = []
            news_list = data.get("result", {}).get("data", [])
            
            # 过滤包含关键词的新闻
            filtered_news = []
            for news in news_list:
                title = news.get("title", "")
                if keyword.lower() in title.lower():
                    filtered_news.append(news)
            
            # 如果没有匹配的新闻，取前5条
            if not filtered_news:
                filtered_news = news_list[:5]
            
            for news in filtered_news[:5]:  # 最多返回5条
                news_item = {
                    "title": news.get("title", ""),
                    "source": news.get("author_name", "聚合数据"),
                    "link": news.get("url", ""),
                    "publishedAt": news.get("date", datetime.now().isoformat()),
                    "tags": [keyword],
                    "imageUrl": news.get("thumbnail_pic_s", ""),
                    "content": news.get("title", "")  # 聚合数据API只提供标题
                }
                results.append(news_item)
            
            logger.info(f"聚合数据API返回 {len(results)} 条新闻")
            return results
            
        except Exception as e:
            logger.error(f"聚合数据API调用失败: {e}")
            return []
    
    def _search_newsapi(self, keyword: str) -> List[Dict[str, Any]]:
        """使用NewsAPI.org搜索新闻"""
        try:
            # NewsAPI.org 的 everything 端点，支持关键词搜索
            url = "https://newsapi.org/v2/everything"
            headers = {"X-API-Key": self.api_key}
            params = {
                "q": keyword,
                "language": "en",  # 英文新闻
                "sortBy": "publishedAt",  # 按发布时间排序
                "pageSize": self.settings.get_setting("maxResults"),
                "domains": "techcrunch.com,engadget.com,thenextweb.com,arstechnica.com,wired.com,theverge.com"  # 科技媒体
            }
            
            if not self.api_key or self.api_key.strip() == "":
                logger.warning("NewsAPI.org API密钥未配置，返回模拟数据")
                # 返回模拟数据作为备用
                results = []
                for i in range(5):
                    news_item = {
                        "title": f"[模拟] 关于{keyword}的AI新闻 #{i+1}",
                        "source": "模拟科技媒体",
                        "link": f"https://example.com/ai-news/{i}",
                        "publishedAt": datetime.now().isoformat(),
                        "tags": [keyword, "AI", "科技"],
                        "imageUrl": "https://via.placeholder.com/300x200/3b82f6/ffffff?text=AI+News",
                        "content": f"这是关于{keyword}的模拟AI新闻内容。讨论了人工智能和{keyword}相关的最新技术发展、行业趋势和创新应用。#{i+1}"
                    }
                    results.append(news_item)
                return results
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get("status") != "ok":
                logger.error(f"NewsAPI.org错误: {data.get('message', '未知错误')}")
                return []
            
            results = []
            articles = data.get("articles", [])
            
            for article in articles:
                # 过滤掉被移除的文章
                if article.get("title") == "[Removed]":
                    continue
                    
                news_item = {
                    "title": article.get("title", ""),
                    "source": article.get("source", {}).get("name", ""),
                    "link": article.get("url", ""),
                    "publishedAt": article.get("publishedAt", datetime.now().isoformat()),
                    "tags": [keyword, "AI", "科技"],
                    "imageUrl": article.get("urlToImage") or "https://via.placeholder.com/300x200/3b82f6/ffffff?text=Tech+News",
                    "content": article.get("description", article.get("content", ""))[:200] + "..." if article.get("description") else ""
                }
                results.append(news_item)
            
            logger.info(f"NewsAPI.org返回 {len(results)} 条新闻")
            return results
            
        except Exception as e:
            logger.error(f"NewsAPI.org调用失败: {e}")
            return []


class NewsStorage:
    """新闻存储类"""
    
    def __init__(self, settings: NewsSettings):
        """初始化存储"""
        self.settings = settings
        self.storage_type = settings.get_setting("storageType")
    
    def save_news(self, news_items: List[NewsItem]) -> bool:
        """保存新闻数据"""
        if not news_items:
            logger.warning("没有新闻数据需要保存")
            return False
        
        if self.storage_type == "json":
            return self._save_to_json(news_items)
        elif self.storage_type == "sqlite":
            return self._save_to_sqlite(news_items)
        else:
            logger.error(f"不支持的存储类型: {self.storage_type}")
            return False
    
    def _save_to_json(self, news_items: List[NewsItem]) -> bool:
        """保存到JSON文件"""
        try:
            json_path = self.settings.get_setting("jsonPath")
            # 确保目录存在
            os.makedirs(os.path.dirname(json_path), exist_ok=True)
            
            # 加载现有数据
            existing_data = []
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        existing_data = json.load(f)
                except:
                    existing_data = []
            
            # 创建链接到数据的映射
            existing_map = {item.get("link"): item for item in existing_data}
            max_id = max([item.get("id", 0) for item in existing_data], default=0)
            
            # 覆盖式更新：基于链接判断，存在则更新，不存在则插入
            for item in news_items:
                link = item.get("link", "")
                if link in existing_map:
                    # 如果存在，更新记录（保持原ID）
                    existing_item = existing_map[link]
                    existing_tags = existing_item.get("tags", [])
                    new_tags = item.get("tags", [])
                    merged_tags = list(set(existing_tags + new_tags))
                    
                    # 更新现有记录
                    existing_item.update(item)
                    existing_item["tags"] = merged_tags
                else:
                    # 如果不存在，分配新ID并添加
                    max_id += 1
                    item["id"] = max_id
                    existing_data.append(item)
            
            # 保存合并后的数据
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"已保存 {len(news_items)} 条新闻到 JSON 文件: {json_path}")
            return True
        except Exception as e:
            logger.error(f"保存到JSON失败: {e}")
            return False
    
    def _save_to_sqlite(self, news_items: List[NewsItem]) -> bool:
        """保存到SQLite数据库"""
        try:
            db_path = self.settings.get_setting("dbPath")
            # 确保目录存在
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            # 连接数据库
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # 创建表（如果不存在）
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                source TEXT,
                link TEXT UNIQUE,
                publishedAt TEXT,
                tags TEXT,
                imageUrl TEXT,
                content TEXT
            )
            """)
            
            # 覆盖式更新：基于链接判断，存在则更新，不存在则插入
            for item in news_items:
                # 检查新闻链接是否已存在
                cursor.execute("SELECT id, tags FROM news WHERE link = ?", (item.get("link", ""),))
                existing = cursor.fetchone()
                
                if existing:
                    # 如果存在，更新记录
                    existing_id, existing_tags_str = existing
                    try:
                        existing_tags = json.loads(existing_tags_str) if existing_tags_str else []
                    except:
                        existing_tags = []
                    
                    # 合并标签
                    new_tags = item.get("tags", [])
                    merged_tags = list(set(existing_tags + new_tags))
                    
                    cursor.execute(
                        "UPDATE news SET title=?, source=?, publishedAt=?, tags=?, imageUrl=?, content=? WHERE id=?",
                        (
                            item.get("title", ""),
                            item.get("source", ""),
                            item.get("publishedAt", datetime.now().isoformat()),
                            json.dumps(merged_tags, ensure_ascii=False),
                            item.get("imageUrl", ""),
                            item.get("content", ""),
                            existing_id
                        )
                    )
                else:
                    # 如果不存在，插入新记录
                    cursor.execute(
                        "INSERT INTO news (title, source, link, publishedAt, tags, imageUrl, content) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (
                            item.get("title", ""),
                            item.get("source", ""),
                            item.get("link", ""),
                            item.get("publishedAt", datetime.now().isoformat()),
                            json.dumps(item.get("tags", []), ensure_ascii=False),
                            item.get("imageUrl", ""),
                            item.get("content", "")
                        )
                    )
            
            # 提交事务
            conn.commit()
            conn.close()
            
            logger.info(f"已保存 {len(news_items)} 条新闻到 SQLite 数据库: {db_path}")
            return True
        except Exception as e:
            logger.error(f"保存到SQLite失败: {e}")
            return False


class NewsScraper:
    """新闻抓取器主类"""
    
    def __init__(self, settings_file: str = "settings.json"):
        """初始化抓取器"""
        self.settings = NewsSettings(settings_file)
        self.api = NewsAPI(self.settings)
        self.storage = NewsStorage(self.settings)
    
    def run(self) -> None:
        """运行抓取任务"""
        logger.info("开始抓取新闻数据...")
        
        # 获取关键词列表
        keywords = self.settings.get_keywords()
        if not keywords:
            logger.error("没有设置关键词，无法抓取新闻")
            return
        
        logger.info(f"将使用以下关键词抓取: {', '.join(keywords)}")
        
        # 检查API密钥
        api_key = self.settings.get_setting("apiKey")
        if not api_key and self.settings.get_setting("apiProvider") != "baidu":
            logger.warning(f"未设置API密钥，{self.settings.get_setting('apiProvider')}搜索可能会失败")
        
        # 抓取每个关键词的新闻
        all_news = []
        for keyword in keywords:
            logger.info(f"正在抓取关键词: {keyword}")
            news_items = self.api.search_news(keyword)
            logger.info(f"找到 {len(news_items)} 条关于 '{keyword}' 的新闻")
            all_news.extend(news_items)
            
            # 避免API限制，添加延迟
            time.sleep(1)
        
        # 保存所有新闻
        if all_news:
            success = self.storage.save_news(all_news)
            if success:
                logger.info(f"成功保存了 {len(all_news)} 条新闻")
            else:
                logger.error("保存新闻数据失败")
        else:
            logger.warning("没有找到任何新闻")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="新闻数据抓取脚本")
    parser.add_argument("-s", "--settings", default="settings.json", help="设置文件路径")
    parser.add_argument("-k", "--keywords", help="覆盖设置文件中的关键词（逗号分隔）")
    parser.add_argument("-t", "--storage-type", choices=["json", "sqlite"], help="存储类型（json或sqlite）")
    parser.add_argument("-a", "--api", choices=["brave", "bing", "baidu", "juhe", "newsapi"], help="API提供商")
    parser.add_argument("--api-key", help="API密钥")
    
    args = parser.parse_args()
    
    # 创建抓取器
    scraper = NewsScraper(args.settings)
    
    # 应用命令行参数覆盖设置
    if args.keywords:
        scraper.settings.update_setting("keywords", args.keywords)
    
    if args.storage_type:
        scraper.settings.update_setting("storageType", args.storage_type)
    
    if args.api:
        scraper.settings.update_setting("apiProvider", args.api)
    
    if args.api_key:
        scraper.settings.update_setting("apiKey", args.api_key)
    
    # 运行抓取器
    scraper.run()


if __name__ == "__main__":
    main()