# Docker 部署文件说明

本目录包含 Docker 部署所需的配置文件。

## 文件说明

- **nginx.conf**: Nginx 主配置文件，包含全局设置
- **default.conf**: Nginx 站点配置文件，定义网站访问规则
- **entrypoint.sh**: 容器启动脚本，负责初始化和启动服务
- **crontab**: 定时任务配置，设置新闻抓取频率

## 使用方法

这些文件会被 Dockerfile 自动复制到容器中，通常不需要手动修改。如果需要自定义配置，可以：

1. 修改这些文件
2. 重新构建容器：`docker compose up -d --build`

或者通过卷挂载覆盖容器内的配置：

```yaml
volumes:
  - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./docker/default.conf:/etc/nginx/conf.d/default.conf:ro
```

## 配置说明

### Nginx 配置

`nginx.conf` 包含全局性能优化：
- 工作进程数
- 连接数限制
- Gzip 压缩
- 缓冲区设置
- 安全头设置

`default.conf` 包含站点特定配置：
- 静态文件缓存
- 数据库文件访问
- 路由规则
- 错误页面

### 定时任务

`crontab` 配置了以下任务：
- 每30分钟抓取一次新闻
- 每天清理旧日志
- 每周备份数据库

### 启动脚本

`entrypoint.sh` 执行以下操作：
- 初始化目录结构
- 创建数据库软链接
- 启动定时任务服务
- 启动 Nginx 服务
- 运行初始新闻抓取
- 处理信号以优雅关闭

## 自定义

### 修改抓取频率

编辑 `crontab` 文件：

```
# 每小时抓取一次新闻
0 * * * * cd /app/scripts && python3 news_scraper.py >> /app/logs/scraper.log 2>&1
```

### 修改 Nginx 缓存

编辑 `default.conf` 文件：

```nginx
# 静态文件缓存
location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff2|woff|ttf|eot)$ {
    expires 7d;  # 修改为7天
    add_header Cache-Control "public, no-transform";
    try_files $uri =404;
}
```

### 添加自定义头

编辑 `nginx.conf` 文件：

```nginx
# 安全相关
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header X-Frame-Options SAMEORIGIN;
add_header Content-Security-Policy "default-src 'self';";
```