# IDSGNews - 新闻抓取系统

一个现代化的新闻抓取和展示系统，支持自动抓取、数据存储和 Web 界面展示。

## ✨ 特性

- 🚀 **自动抓取** - 定时抓取最新新闻内容
- 💾 **双重存储** - 支持 SQLite 数据库和 JSON 文件存储
- 🌐 **现代界面** - 基于 React + TypeScript 的响应式 Web 界面
- 🔄 **智能更新** - 基于链接的去重和更新机制
- 📱 **移动友好** - 完全响应式设计，支持各种设备
- 🐳 **容器化部署** - 支持 Docker 一键部署
- ⚡ **高性能** - Nginx 静态文件服务，优化的缓存策略

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 克隆项目
git clone https://github.com/your-username/idsgnews.git
cd idsgnews

# 一键启动
./docker-start.sh

# 或者手动启动
docker compose up -d
```

访问 http://localhost 即可查看您的新闻网站！

### 方式二：传统部署

#### 开发环境

```bash
# 安装依赖
npm install

# 安装 Python 依赖
cd scripts
pip3 install -r requirements.txt
cd ..

# 启动开发服务器
npm run dev

# 运行新闻抓取（另一个终端）
cd scripts
python3 news_scraper.py
```

#### 生产环境

```bash
# 构建应用
npm run build

# 预览构建结果
npm run preview

# 服务器部署
sudo ./deploy.sh
```

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── services/          # 数据服务
│   └── types/             # TypeScript 类型定义
├── scripts/               # Python 抓取脚本
│   ├── news_scraper.py    # 主抓取脚本
│   ├── requirements.txt   # Python 依赖
│   └── settings.json      # 抓取配置
├── docker/                # Docker 配置文件
├── public/                # 静态资源
├── dist/                  # 构建输出
└── data/                  # 数据存储目录
```

## 🔧 配置说明

### 环境变量

创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://your-domain.com
VITE_NEWS_UPDATE_INTERVAL=300000
VITE_MAX_NEWS_ITEMS=100
```

### 新闻抓取配置

编辑 `scripts/settings.json`：

```json
{
  "sources": [
    {
      "name": "示例新闻站",
      "url": "https://example.com/news",
      "selectors": {
        "title": ".news-title",
        "link": ".news-link",
        "summary": ".news-summary"
      }
    }
  ],
  "max_items": 50,
  "timeout": 30
}
```

## 🐳 Docker 部署详解

### 快速部署

```bash
# 使用简化配置
docker-compose -f docker-compose.simple.yml up -d

# 使用完整配置
docker compose up -d
```

### 自定义配置

1. 复制环境变量模板：
   ```bash
   cp .env.docker .env
   ```

2. 编辑 `.env` 文件根据需要修改配置

3. 启动服务：
   ```bash
   docker compose up -d
   ```

### 管理容器

```bash
# 查看状态
docker-compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker compose down
```

## 📊 数据存储

系统支持两种数据存储方式：

### SQLite 数据库
- 文件位置：`public/news.db`
- 结构化存储，支持复杂查询
- 自动创建索引，查询性能优秀

### JSON 文件
- 文件位置：`public/news.json`
- 轻量级存储，便于调试
- 直接可读，方便数据迁移

## 🔄 定时任务

系统会自动设置定时任务：

```bash
# 每30分钟抓取一次新闻
*/30 * * * * cd /path/to/scripts && python3 news_scraper.py

# 每天清理旧日志
0 3 * * * find /path/to/logs -name "*.log" -mtime +7 -delete
```

## 🛠️ 开发指南

### 添加新的新闻源

1. 编辑 `scripts/settings.json`
2. 添加新的源配置
3. 测试抓取效果
4. 重启服务

### 自定义界面

1. 修改 `src/components/` 中的组件
2. 更新样式文件
3. 重新构建：`npm run build`

### 扩展功能

- 添加新的数据服务：`src/services/`
- 创建新页面：`src/pages/`
- 定义类型：`src/types/`

## 📋 部署选项

| 部署方式 | 适用场景 | 优势 | 劣势 |
|----------|----------|------|------|
| Docker | 生产环境、快速部署 | 环境一致、易管理 | 需要 Docker 知识 |
| 传统部署 | 自定义需求高 | 灵活配置 | 环境依赖复杂 |
| 开发模式 | 本地开发 | 热重载、调试方便 | 不适合生产 |

## 🔍 故障排除

### 常见问题

**Q: 新闻不更新？**
A: 检查定时任务和抓取日志：
```bash
# Docker 环境
docker-compose exec idsgnews cat /app/logs/scraper.log

# 传统部署
cat scripts/scraper.log
```

**Q: 网站无法访问？**
A: 检查服务状态和端口：
```bash
# Docker 环境
docker-compose ps
docker-compose logs nginx

# 传统部署
sudo systemctl status nginx
sudo netstat -tlnp | grep :80
```

**Q: 数据库文件不存在？**
A: 手动运行一次抓取：
```bash
# Docker 环境
docker-compose exec idsgnews python3 /app/scripts/news_scraper.py

# 传统部署
cd scripts && python3 news_scraper.py
```

## 📚 文档

- [Docker 部署指南](DOCKER_DEPLOYMENT.md)
- [服务器部署指南](SERVER_SETUP_GUIDE.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)
- [数据存储说明](README_DATA_STORAGE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Nginx](https://nginx.org/) - 高性能 Web 服务器
- [Python](https://python.org/) - 新闻抓取脚本语言
- [Docker](https://docker.com/) - 容器化平台

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
