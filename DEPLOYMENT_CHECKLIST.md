# 🚀 部署检查清单

使用此清单确保部署过程的每个步骤都正确完成。

## 📋 部署前检查

### ☐ 服务器准备
- [ ] 服务器满足最低配置要求（512MB内存，2GB磁盘）
- [ ] 具有 root 或 sudo 权限
- [ ] 服务器可以访问互联网
- [ ] SSH 连接正常
- [ ] 开放了 HTTP (80) 和 HTTPS (443) 端口

### ☐ 代码准备
- [ ] 代码已上传到服务器
- [ ] 所有必要文件都存在：
  - [ ] `deploy.sh`
  - [ ] `check-environment.sh`
  - [ ] `package.json`
  - [ ] `scripts/requirements.txt`
  - [ ] `.env.production`

## 🔍 环境检查

### ☐ 运行环境检查脚本
```bash
sudo ./check-environment.sh
```

**检查项目：**
- [ ] 操作系统版本支持
- [ ] 用户权限正确
- [ ] 内存充足（≥512MB）
- [ ] 磁盘空间充足（≥2GB）
- [ ] 网络连接正常
- [ ] DNS 解析正常
- [ ] 包管理器可用
- [ ] 端口 80/443 可用

**如果检查失败：**
- [ ] 解决所有 `[FAIL]` 项目
- [ ] 处理重要的 `[WARN]` 项目
- [ ] 重新运行检查直到通过

## 🚀 执行部署

### ☐ 运行部署脚本
```bash
sudo ./deploy.sh
```

**部署步骤验证：**
- [ ] 系统更新完成
- [ ] Node.js 安装成功
- [ ] Python3 和 pip3 安装成功
- [ ] Nginx 安装成功
- [ ] Git 安装成功
- [ ] 项目依赖安装完成
- [ ] 前端应用构建成功
- [ ] 数据库文件创建成功
- [ ] Nginx 配置完成
- [ ] 定时任务设置完成
- [ ] 服务启动成功

## ✅ 部署验证

### ☐ 服务状态检查
```bash
# 检查 Nginx 状态
sudo systemctl status nginx
# 应该显示 "active (running)"

# 检查端口监听
sudo netstat -tlnp | grep :80
# 应该显示 nginx 在监听 80 端口
```

- [ ] Nginx 服务运行正常
- [ ] 端口 80 正在监听
- [ ] 没有错误信息

### ☐ 网站访问测试
```bash
# 本地测试
curl -I http://localhost
# 应该返回 200 OK

# 外部访问测试
curl -I http://your-server-ip
# 应该返回 200 OK
```

- [ ] 本地访问返回 200 状态码
- [ ] 外部访问返回 200 状态码
- [ ] 网页内容正常显示
- [ ] 没有 404 或 500 错误

### ☐ 数据功能测试
```bash
# 手动运行新闻抓取
cd /root/idsgnews/scripts
python3 news_scraper.py
```

- [ ] 新闻抓取脚本运行成功
- [ ] 生成了 `news.db` 文件
- [ ] 数据库包含新闻数据
- [ ] 网页显示抓取的新闻

### ☐ 定时任务验证
```bash
# 检查定时任务
sudo crontab -l
# 应该显示新闻抓取的定时任务
```

- [ ] 定时任务已设置
- [ ] 任务配置正确（每30分钟执行）
- [ ] 日志路径正确

## 🔧 配置优化（可选）

### ☐ 环境变量配置
- [ ] 编辑 `.env.production` 文件
- [ ] 设置正确的域名和 API 地址
- [ ] 配置合适的更新间隔

### ☐ SSL 证书配置（推荐）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

- [ ] SSL 证书安装成功
- [ ] HTTPS 访问正常
- [ ] 自动续期设置完成

### ☐ 性能优化
- [ ] Nginx 配置优化
- [ ] Gzip 压缩启用
- [ ] 静态文件缓存设置
- [ ] 安全头配置

## 📊 监控设置

### ☐ 日志配置
- [ ] 新闻抓取日志：`/root/idsgnews/scripts/scraper.log`
- [ ] Nginx 访问日志：`/var/log/nginx/idsgnews_access.log`
- [ ] Nginx 错误日志：`/var/log/nginx/idsgnews_error.log`
- [ ] 日志轮转配置

### ☐ 备份策略
- [ ] 创建备份脚本
- [ ] 设置自动备份定时任务
- [ ] 测试备份和恢复流程

## 🔍 最终检查

### ☐ 功能完整性测试
- [ ] 网站首页正常加载
- [ ] 新闻列表显示正常
- [ ] 新闻详情页面正常
- [ ] 搜索功能正常（如果有）
- [ ] 响应式设计在移动设备上正常

### ☐ 性能测试
```bash
# 简单压力测试
ab -n 100 -c 10 http://your-server-ip/
```

- [ ] 页面加载时间 < 3秒
- [ ] 服务器响应稳定
- [ ] 内存使用正常
- [ ] CPU 使用正常

### ☐ 安全检查
- [ ] 不必要的端口已关闭
- [ ] 防火墙配置正确
- [ ] 文件权限设置合理
- [ ] 敏感信息未暴露

## 📝 部署后任务

### ☐ 文档记录
- [ ] 记录服务器信息（IP、域名、登录方式）
- [ ] 记录重要配置文件位置
- [ ] 记录管理员账户信息
- [ ] 创建运维手册

### ☐ 团队通知
- [ ] 通知相关人员部署完成
- [ ] 分享访问地址
- [ ] 提供管理员权限
- [ ] 安排培训（如需要）

## 🚨 故障排除

如果遇到问题，按以下顺序检查：

### 1. 服务状态
```bash
sudo systemctl status nginx
sudo systemctl status cron
```

### 2. 日志文件
```bash
tail -f /var/log/nginx/error.log
tail -f /root/idsgnews/scripts/scraper.log
```

### 3. 网络连接
```bash
ping google.com
nslookup your-domain.com
```

### 4. 文件权限
```bash
ls -la /root/idsgnews/
ls -la /root/idsgnews/dist/
```

### 5. 重启服务
```bash
sudo systemctl restart nginx
sudo systemctl restart cron
```

---

## ✅ 部署完成确认

当所有检查项都完成后，您的新闻抓取系统应该：

- ✅ 网站可以正常访问
- ✅ 新闻数据自动更新
- ✅ 服务稳定运行
- ✅ 日志记录正常
- ✅ 备份策略就位

**恭喜！您的新闻抓取系统已成功部署！** 🎉

---

**快速命令参考：**
```bash
# 查看服务状态
sudo systemctl status nginx

# 查看实时日志
tail -f /root/idsgnews/scripts/scraper.log

# 手动抓取新闻
cd /root/idsgnews/scripts && python3 news_scraper.py

# 重启服务
sudo systemctl restart nginx

# 查看定时任务
sudo crontab -l
```