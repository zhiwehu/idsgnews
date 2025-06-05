# 服务器部署完整指南

本指南将帮助您在 Linux 服务器上完整部署新闻抓取系统。

## 📋 部署前准备

### 1. 服务器要求

**最低配置：**
- CPU: 1核
- 内存: 512MB
- 磁盘: 2GB 可用空间
- 操作系统: Ubuntu 18.04+, Debian 10+, CentOS 7+

**推荐配置：**
- CPU: 2核
- 内存: 1GB
- 磁盘: 5GB 可用空间
- 带宽: 1Mbps+

### 2. 网络要求

- 服务器能够访问互联网
- 开放 HTTP (80) 和 HTTPS (443) 端口
- SSH 访问权限 (22 端口)

## 🚀 快速部署

### 步骤 1: 连接服务器

```bash
# 使用 SSH 连接到服务器
ssh root@your-server-ip

# 或使用普通用户（需要 sudo 权限）
ssh username@your-server-ip
```

### 步骤 2: 上传代码

**方法 1: 使用 Git（推荐）**
```bash
# 克隆代码仓库
git clone https://github.com/your-username/idsgnews.git
cd idsgnews
```

**方法 2: 使用 SCP 上传**
```bash
# 在本地机器上执行
scp -r /path/to/idsgnews root@your-server-ip:/root/

# 然后在服务器上
cd /root/idsgnews
```

**方法 3: 使用 rsync**
```bash
# 在本地机器上执行
rsync -avz --exclude 'node_modules' --exclude 'dist' /path/to/idsgnews/ root@your-server-ip:/root/idsgnews/
```

### 步骤 3: 环境检查

```bash
# 运行环境检查脚本
sudo ./check-environment.sh
```

如果检查通过，继续下一步。如果有错误，请根据提示解决。

### 步骤 4: 执行部署

```bash
# 运行部署脚本
sudo ./deploy.sh
```

部署脚本将自动：
1. 安装所需软件（Node.js, Python3, Nginx 等）
2. 安装项目依赖
3. 构建前端应用
4. 配置 Nginx
5. 设置定时任务
6. 启动服务

### 步骤 5: 验证部署

```bash
# 检查服务状态
sudo systemctl status nginx
sudo systemctl status cron

# 检查端口监听
sudo netstat -tlnp | grep :80

# 测试新闻抓取
cd /root/idsgnews/scripts
python3 news_scraper.py
```

访问 `http://your-server-ip` 查看网站是否正常运行。

## 🔧 详细配置

### 环境变量配置

编辑 `.env.production` 文件：

```bash
nano .env.production
```

```env
# 生产环境配置
VITE_API_BASE_URL=http://your-domain.com
VITE_NEWS_UPDATE_INTERVAL=300000
VITE_MAX_NEWS_ITEMS=100
```

### Nginx 配置优化

编辑 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/idsgnews
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 主要配置
    root /root/idsgnews/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 数据库文件
    location /news.db {
        add_header Content-Type application/octet-stream;
    }
    
    # 日志
    access_log /var/log/nginx/idsgnews_access.log;
    error_log /var/log/nginx/idsgnews_error.log;
}
```

### SSL/HTTPS 配置（可选）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

### 定时任务配置

编辑 crontab：

```bash
sudo crontab -e
```

添加以下任务：

```cron
# 每30分钟抓取一次新闻
*/30 * * * * cd /root/idsgnews/scripts && /usr/bin/python3 news_scraper.py >> scraper.log 2>&1

# 每天凌晨清理日志（保留最近7天）
0 0 * * * find /root/idsgnews/scripts -name "*.log" -mtime +7 -delete

# 每周重启 Nginx（可选）
0 3 * * 0 /usr/bin/systemctl restart nginx
```

## 📊 监控和维护

### 日志查看

```bash
# 查看新闻抓取日志
tail -f /root/idsgnews/scripts/scraper.log

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/idsgnews_access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/idsgnews_error.log

# 查看系统日志
sudo journalctl -u nginx -f
```

### 性能监控

```bash
# 查看系统资源使用
top
htop  # 需要安装: sudo apt install htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
sudo netstat -tlnp
```

### 备份策略

创建备份脚本：

```bash
nano /root/backup.sh
```

```bash
#!/bin/bash

# 备份配置
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/root/idsgnews"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $PROJECT_DIR/public/news.db $BACKUP_DIR/news_$DATE.db

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz $PROJECT_DIR/.env.production $PROJECT_DIR/scripts/settings.json

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $DATE"
```

```bash
# 添加执行权限
chmod +x /root/backup.sh

# 添加到定时任务
sudo crontab -e
# 添加：每天凌晨2点备份
0 2 * * * /root/backup.sh >> /root/backup.log 2>&1
```

## 🔍 故障排除

### 常见问题

**1. 网站无法访问**

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep :80

# 检查防火墙
sudo ufw status

# 重启 Nginx
sudo systemctl restart nginx
```

**2. 新闻数据不更新**

```bash
# 手动运行抓取脚本
cd /root/idsgnews/scripts
python3 news_scraper.py

# 检查定时任务
sudo crontab -l

# 查看抓取日志
tail -f scraper.log
```

**3. 数据库文件无法访问**

```bash
# 检查文件权限
ls -la /root/idsgnews/public/news.db
ls -la /root/idsgnews/dist/news.db

# 修复权限
sudo chown www-data:www-data /root/idsgnews/public/news.db
sudo chmod 644 /root/idsgnews/public/news.db
```

**4. 内存不足**

```bash
# 创建交换文件
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 性能优化

**1. Nginx 优化**

编辑 `/etc/nginx/nginx.conf`：

```nginx
worker_processes auto;
worker_connections 1024;

# 启用 sendfile
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# 调整缓冲区
client_body_buffer_size 128k;
client_max_body_size 10m;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
```

**2. 系统优化**

```bash
# 调整文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化网络参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sudo sysctl -p
```

## 🔄 更新部署

### 代码更新

```bash
# 进入项目目录
cd /root/idsgnews

# 拉取最新代码
git pull origin main

# 安装新依赖（如果有）
npm install
cd scripts && pip3 install -r requirements.txt && cd ..

# 重新构建
npm run build

# 复制数据库文件（如果需要）
cp public/news.db dist/

# 重启服务
sudo systemctl reload nginx
```

### 自动化更新脚本

创建更新脚本：

```bash
nano /root/update.sh
```

```bash
#!/bin/bash

set -e

PROJECT_DIR="/root/idsgnews"
LOG_FILE="/root/update.log"

echo "[$(date)] 开始更新..." >> $LOG_FILE

cd $PROJECT_DIR

# 备份当前版本
cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)

# 拉取最新代码
git pull origin main >> $LOG_FILE 2>&1

# 安装依赖
npm install >> $LOG_FILE 2>&1
cd scripts && pip3 install -r requirements.txt >> $LOG_FILE 2>&1 && cd ..

# 构建应用
npm run build >> $LOG_FILE 2>&1

# 确保数据库文件存在
if [ -f "public/news.db" ]; then
    cp public/news.db dist/
fi

# 重启服务
sudo systemctl reload nginx

echo "[$(date)] 更新完成" >> $LOG_FILE
```

```bash
chmod +x /root/update.sh
```

## 📞 技术支持

如果遇到问题，请：

1. 查看相关日志文件
2. 检查系统资源使用情况
3. 确认网络连接正常
4. 参考本文档的故障排除部分

**日志文件位置：**
- 新闻抓取日志: `/root/idsgnews/scripts/scraper.log`
- Nginx 访问日志: `/var/log/nginx/idsgnews_access.log`
- Nginx 错误日志: `/var/log/nginx/idsgnews_error.log`
- 系统日志: `sudo journalctl -u nginx`

**常用命令：**
```bash
# 查看服务状态
sudo systemctl status nginx

# 重启服务
sudo systemctl restart nginx

# 查看端口使用
sudo netstat -tlnp

# 查看系统资源
top
df -h
free -h
```

---

**部署成功后，您的新闻抓取系统将：**
- ✅ 每30分钟自动抓取最新新闻
- ✅ 通过 Web 界面展示新闻内容
- ✅ 自动备份重要数据
- ✅ 提供完整的日志记录
- ✅ 支持高并发访问

祝您部署顺利！🎉