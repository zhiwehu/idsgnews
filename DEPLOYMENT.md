# 服务器部署指南

本文档介绍如何将新闻抓取系统部署到 Linux 服务器上。

## 快速部署

### 1. 准备服务器

- **操作系统**: Ubuntu 18.04+ 或 CentOS 7+
- **内存**: 至少 1GB RAM
- **存储**: 至少 2GB 可用空间
- **权限**: root 访问权限

### 2. 上传代码

```bash
# 方法1: 使用 git 克隆
git clone <your-repo-url>
cd idsgnews

# 方法2: 使用 scp 上传
scp -r ./idsgnews root@your-server:/tmp/
ssh root@your-server
cd /tmp/idsgnews
```

### 3. 修改配置

编辑部署脚本中的域名配置：

```bash
nano deploy.sh
# 修改这一行:
DOMAIN="your-domain.com"  # 改为您的实际域名
```

### 4. 执行部署

```bash
sudo ./deploy.sh
```

部署脚本将自动完成以下操作：

- ✅ 安装系统依赖 (nginx, python3, nodejs)
- ✅ 创建应用用户和目录
- ✅ 安装应用依赖
- ✅ 构建前端应用
- ✅ 配置 systemd 服务
- ✅ 配置 nginx 反向代理
- ✅ 设置定时任务 (每小时抓取一次)
- ✅ 启动所有服务

## 部署后管理

### 服务管理

```bash
# 查看服务状态
sudo systemctl status idsgnews

# 启动/停止/重启服务
sudo systemctl start idsgnews
sudo systemctl stop idsgnews
sudo systemctl restart idsgnews

# 查看服务日志
sudo journalctl -u idsgnews -f
```

### 手动抓取数据

```bash
# 切换到应用目录
cd /opt/idsgnews/scripts

# 手动执行抓取
sudo -u www-data python3 news_scraper.py
```

### 查看抓取日志

```bash
# 查看定时抓取日志
sudo tail -f /var/log/idsgnews_scraper.log
```

### 更新应用

```bash
# 1. 停止服务
sudo systemctl stop idsgnews

# 2. 备份数据
sudo cp /opt/idsgnews/public/news.db /opt/idsgnews/backup_$(date +%Y%m%d_%H%M%S).db

# 3. 更新代码
cd /opt/idsgnews
sudo git pull origin main

# 4. 重新构建
sudo -u www-data npm install
sudo -u www-data npm run build

# 5. 重启服务
sudo systemctl start idsgnews
```

## 配置说明

### 应用配置

- **应用目录**: `/opt/idsgnews`
- **服务用户**: `www-data`
- **应用端口**: `3000`
- **数据库文件**: `/opt/idsgnews/public/news.db`

### Nginx 配置

- **配置文件**: `/etc/nginx/sites-available/idsgnews`
- **访问端口**: `80` (HTTP)
- **反向代理**: `localhost:3000`

### 定时任务

- **频率**: 每小时执行一次
- **脚本**: `/opt/idsgnews/scripts/auto_scrape.sh`
- **日志**: `/var/log/idsgnews_scraper.log`

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :3000
   
   # 检查服务日志
   sudo journalctl -u idsgnews --no-pager
   ```

2. **Nginx 配置错误**
   ```bash
   # 测试 nginx 配置
   sudo nginx -t
   
   # 重新加载配置
   sudo systemctl reload nginx
   ```

3. **数据抓取失败**
   ```bash
   # 检查 Python 依赖
   sudo -u www-data python3 -c "import requests, beautifulsoup4"
   
   # 手动测试抓取
   cd /opt/idsgnews/scripts
   sudo -u www-data python3 news_scraper.py
   ```

4. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R www-data:www-data /opt/idsgnews
   sudo chmod +x /opt/idsgnews/scripts/auto_scrape.sh
   ```

### 性能优化

1. **启用 HTTPS**
   ```bash
   # 安装 certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取 SSL 证书
   sudo certbot --nginx -d your-domain.com
   ```

2. **配置防火墙**
   ```bash
   # 允许 HTTP/HTTPS 流量
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

3. **监控资源使用**
   ```bash
   # 查看内存使用
   free -h
   
   # 查看磁盘使用
   df -h
   
   # 查看进程状态
   htop
   ```

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **配置自动备份**
   ```bash
   # 添加到 crontab
   0 2 * * * cp /opt/idsgnews/public/news.db /opt/idsgnews/backups/news_$(date +\%Y\%m\%d).db
   ```

3. **限制访问权限**
   - 使用非 root 用户运行应用
   - 配置防火墙规则
   - 定期更新依赖包

## 联系支持

如果遇到部署问题，请检查：

1. 系统日志: `sudo journalctl -xe`
2. 应用日志: `sudo journalctl -u idsgnews -f`
3. Nginx 日志: `sudo tail -f /var/log/nginx/error.log`
4. 抓取日志: `sudo tail -f /var/log/idsgnews_scraper.log`