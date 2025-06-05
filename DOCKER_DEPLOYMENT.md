# Docker 部署指南

本指南将帮助您使用 Docker 和 Docker Compose 快速部署新闻抓取系统。

## 🚀 快速开始

### 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 1. HTTP部署（开发/测试环境）

#### 使用一键部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x docker-start.sh

# 运行一键部署脚本
./docker-start.sh
```

#### 手动部署

```bash
# 克隆项目
git clone <your-repo-url>
cd idsgnews

# 创建必要的目录
mkdir -p data logs

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 2. HTTPS部署（生产环境）

#### 使用SSL一键部署脚本（推荐）

```bash
# 给SSL部署脚本添加执行权限
chmod +x docker-ssl-deploy.sh

# 运行SSL部署脚本
./docker-ssl-deploy.sh
```

脚本会引导您完成以下步骤：
1. 输入域名和邮箱
2. 选择是否使用测试证书
3. 自动获取SSL证书
4. 配置HTTPS重定向
5. 设置证书自动续期

#### 手动SSL部署

```bash
# 1. 复制SSL环境变量配置
cp .env.ssl .env

# 2. 编辑配置文件，修改域名和邮箱
vim .env

# 3. 创建必要的目录
mkdir -p data logs certbot/conf certbot/www certbot/logs

# 4. 使用SSL配置启动服务
docker-compose -f docker-compose.ssl.yml up -d

# 5. 查看服务状态
docker-compose -f docker-compose.ssl.yml ps
```

访问 http://localhost 即可查看您的新闻网站！

## 🔧 配置说明

### 目录结构

```
idsgnews/
├── docker-compose.yml          # Docker Compose 配置文件 (HTTP)
├── docker-compose.ssl.yml      # Docker Compose SSL配置文件 (HTTPS)
├── docker-compose.simple.yml   # 简化版配置文件
├── Dockerfile                  # Docker 镜像构建文件
├── docker-start.sh            # HTTP一键启动脚本
├── docker-ssl-deploy.sh       # HTTPS SSL部署脚本
├── .env.docker                # 环境变量配置模板
├── .env.ssl                   # SSL环境变量配置模板
├── .dockerignore              # Docker 构建忽略文件
├── docker/                    # Docker 相关配置文件
│   ├── nginx.conf            # Nginx 主配置
│   ├── default.conf          # Nginx 站点配置 (HTTP)
│   ├── nginx-ssl.conf        # Nginx SSL站点配置 (HTTPS)
│   ├── entrypoint.sh         # 容器启动脚本
│   └── crontab               # 定时任务配置
├── data/                     # 数据持久化目录
│   ├── news.db              # SQLite 数据库
│   └── news.json            # JSON 数据文件
├── logs/                     # 日志文件目录
├── certbot/                  # SSL证书相关目录
│   ├── conf/                # Let's Encrypt 证书配置
│   ├── www/                 # ACME 验证文件
│   └── logs/                # Certbot 日志
└── certbot-renew.sh          # 证书自动续期脚本
```

### 环境变量

#### HTTP部署环境变量

可以通过 `.env` 文件或环境变量来配置应用：

```bash
# 复制环境变量模板
cp .env.docker .env

# 编辑配置
vim .env
```

主要配置项：

```env
# 应用配置
NODE_ENV=production
TZ=Asia/Shanghai

# 新闻抓取配置
NEWS_UPDATE_INTERVAL=1800  # 30分钟
MAX_NEWS_ITEMS=100
LOG_LEVEL=INFO

# 端口配置
HTTP_PORT=8080
HTTPS_PORT=8443

# 数据库配置
DB_PATH=/app/public/news.db
JSON_PATH=/app/public/news.json
```

#### HTTPS部署环境变量

对于SSL部署，使用专门的SSL环境变量配置：

```bash
# 复制SSL环境变量模板
cp .env.ssl .env

# 编辑SSL配置
vim .env
```

SSL相关配置项：

```env
# 域名和SSL配置 (必须修改)
DOMAIN=your-domain.com
EMAIL=your-email@example.com
ENABLE_SSL=true
USE_STAGING=true  # 首次部署建议使用测试证书

# SSL安全配置
SSL_PROTOCOLS="TLSv1.2 TLSv1.3"
SSL_SESSION_CACHE="shared:SSL:10m"
SSL_SESSION_TIMEOUT=10m
HSTS_MAX_AGE=31536000

# 安全头配置
ENABLE_SECURITY_HEADERS=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION="1; mode=block"
REFERRER_POLICY="strict-origin-when-cross-origin"
```

您也可以在 `docker-compose.yml` 文件中直接修改以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `TZ` | 时区 | `Asia/Shanghai` |
| `NEWS_UPDATE_INTERVAL` | 新闻更新间隔（秒） | `1800` (30分钟) |
| `MAX_NEWS_ITEMS` | 最大新闻条数 | `100` |
| `LOG_LEVEL` | 日志级别 | `INFO` |

## 📊 管理容器

### HTTP部署管理

#### 查看状态

```bash
# 查看所有服务状态
docker-compose ps

# 查看特定服务状态
docker-compose ps idsgnews
```

#### 停止和重启

```bash
# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart idsgnews
```

#### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f idsgnews

# 查看最近100行日志
docker-compose logs --tail=100 idsgnews
```

### HTTPS部署管理

#### 查看SSL服务状态

```bash
# 查看SSL服务状态
docker-compose -f docker-compose.ssl.yml ps

# 查看证书状态
docker exec idsgnews-app-ssl ls -la /etc/letsencrypt/live/
```

#### SSL服务管理

```bash
# 停止SSL服务
docker-compose -f docker-compose.ssl.yml down

# 重启SSL服务
docker-compose -f docker-compose.ssl.yml restart

# 查看SSL服务日志
docker-compose -f docker-compose.ssl.yml logs -f
```

#### SSL证书管理

```bash
# 手动续期证书
./certbot-renew.sh

# 查看证书到期时间
docker exec idsgnews-certbot certbot certificates

# 测试证书续期（不实际续期）
docker exec idsgnews-certbot certbot renew --dry-run

# 查看Certbot日志
docker-compose -f docker-compose.ssl.yml logs certbot
```

### 通用管理命令

#### 手动触发新闻抓取

```bash
# HTTP部署
docker exec -it idsgnews-app python3 /app/scripts/news_scraper.py

# HTTPS部署
docker exec -it idsgnews-app-ssl python3 /app/scripts/news_scraper.py

# 查看抓取日志
docker exec -it idsgnews-app tail -f /app/logs/scraper.log
```

## 🔄 更新应用

当有新版本时，您可以按照以下步骤更新：

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 📁 数据持久化

所有数据都存储在 `./data` 目录中，确保此目录有适当的备份。

```bash
# 备份数据
cp -r ./data ./data_backup_$(date +%Y%m%d)

# 恢复数据
cp -r ./data_backup_YYYYMMDD/* ./data/
```

## 🛠️ 自定义配置

### 修改 Nginx 配置

1. 编辑 `docker/nginx.conf` 或 `docker/default.conf`
2. 重启容器：`docker-compose restart`

### 修改定时任务

1. 编辑 `docker/crontab` 文件
2. 重新构建并启动：`docker-compose up -d --build`

## 🔍 故障排除

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs -f

# 检查 Nginx 配置
docker-compose exec idsgnews nginx -t
```

### 网站无法访问

```bash
# 检查容器状态
docker-compose ps

# 检查端口映射
docker-compose port idsgnews 80

# 检查 Nginx 日志
docker-compose exec idsgnews cat /var/log/nginx/error.log
```

### 新闻不更新

```bash
# 检查定时任务
docker-compose exec idsgnews cat /etc/crontabs/root

# 检查抓取日志
docker-compose exec idsgnews cat /app/logs/scraper.log

# 手动运行抓取
docker-compose exec idsgnews python3 /app/scripts/news_scraper.py
```

## 🚀 生产环境部署

### 使用 HTTPS

对于生产环境，建议配置 HTTPS。您可以：

1. 使用 Nginx 代理：在宿主机上安装 Nginx，配置 SSL 并代理到容器
2. 使用 Traefik：替换 docker-compose.yml 中的配置，使用 Traefik 作为反向代理

### 示例：使用 Traefik 配置 HTTPS

创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  idsgnews:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: idsgnews-app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.idsgnews.rule=Host(`news.yourdomain.com`)"
      - "traefik.http.routers.idsgnews.entrypoints=websecure"
      - "traefik.http.routers.idsgnews.tls.certresolver=myresolver"
    volumes:
      - ./data:/app/public
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    restart: unless-stopped
    networks:
      - traefik-network

  traefik:
    image: traefik:v2.5
    container_name: traefik
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - traefik-network
    restart: unless-stopped

networks:
  traefik-network:
    driver: bridge
```

## 📋 性能优化

### 容器资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  idsgnews:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Nginx 缓存优化

编辑 `docker/nginx.conf` 添加缓存配置：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=24h max_size=1g;
```

## 🔒 安全建议

1. **定期更新镜像**：`docker-compose pull && docker-compose up -d`
2. **限制容器权限**：在 docker-compose.yml 中添加安全选项
3. **使用非 root 用户**：修改 Dockerfile 使用非特权用户
4. **启用内容安全策略**：在 Nginx 配置中添加 CSP 头
5. **定期备份数据**：设置自动备份脚本

## 📞 支持与帮助

如果您在部署过程中遇到问题，请：

1. 查看容器日志：`docker-compose logs -f`
2. 检查应用日志：`docker-compose exec idsgnews cat /app/logs/scraper.log`
3. 验证配置文件：`docker-compose config`

---

祝您部署顺利！🎉