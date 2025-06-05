# 服务器配置文件热更新指南

## 问题说明

当您在服务器上更新了 `scripts/settings.json` 配置文件后，希望不重新构建 Docker 镜像就能让配置生效。

## 解决方案

### 1. 确保 Docker Compose 配置正确

我已经在 `docker-compose.yml` 中添加了 scripts 目录的 volume 挂载：

```yaml
volumes:
  # 持久化数据库文件
  - ./data:/app/public
  # 持久化日志文件
  - ./logs:/app/logs
  # 挂载脚本目录，支持配置文件热更新
  - ./scripts:/app/scripts
  # 可选：自定义配置文件
  - ./docker/default.conf:/etc/nginx/conf.d/default.conf:ro
```

### 2. 服务器操作步骤

#### 步骤 1：上传更新的代码
```bash
# 拉取最新代码（包含新的 docker-compose.yml）
git pull origin main

# 或者手动上传修改后的文件
# scp scripts/settings.json user@server:/path/to/project/scripts/
# scp docker-compose.yml user@server:/path/to/project/
```

#### 步骤 2：停止并重新启动容器（无需重新构建）
```bash
# 停止容器
docker-compose down

# 重新启动容器（使用现有镜像）
docker-compose up -d
```

**重要：** 使用 `docker-compose up -d` 而不是 `docker-compose up --build -d`，这样就不会重新构建镜像。

#### 步骤 3：验证配置是否生效
```bash
# 查看容器日志
docker-compose logs -f idsgnews

# 进入容器检查配置文件
docker exec -it idsgnews-app cat /app/scripts/settings.json

# 手动运行新闻抓取测试
docker exec -it idsgnews-app python3 /app/scripts/news_scraper.py
```

### 3. 配置文件更新示例

假设您要将 API 提供商从 `baidu` 改为 `juhe`：

```json
{
  "keywords": "设计,科技,人工智能,AI",
  "updateTime": "09:00",
  "apiKey": "your_juhe_api_key_here",
  "apiProvider": "juhe",
  "storageType": "sqlite",
  "maxResults": 20,
  "dbPath": "../public/news.db",
  "jsonPath": "../data/news.json"
}
```

### 4. 实时配置更新（无需重启容器）

如果您只是修改配置文件，甚至可以不重启容器：

```bash
# 直接在服务器上修改配置文件
vim scripts/settings.json

# 手动触发新闻抓取，使用新配置
docker exec -it idsgnews-app python3 /app/scripts/news_scraper.py
```

### 5. 自动化脚本

创建一个便捷的更新脚本 `update-config.sh`：

```bash
#!/bin/bash
echo "正在更新配置..."

# 拉取最新代码
git pull origin main

# 重启容器（不重新构建）
docker-compose down
docker-compose up -d

# 等待容器启动
sleep 10

# 测试配置
echo "测试新配置..."
docker exec -it idsgnews-app python3 /app/scripts/news_scraper.py

echo "配置更新完成！"
```

### 6. 注意事项

1. **确保文件权限**：上传的配置文件需要有正确的读取权限
2. **备份配置**：更新前备份原配置文件
3. **验证语法**：确保 JSON 格式正确
4. **API 密钥安全**：不要将真实的 API 密钥提交到代码仓库

### 7. 故障排查

如果配置不生效：

```bash
# 检查 volume 挂载是否正确
docker inspect idsgnews-app | grep -A 10 "Mounts"

# 检查容器内的配置文件
docker exec -it idsgnews-app ls -la /app/scripts/
docker exec -it idsgnews-app cat /app/scripts/settings.json

# 检查容器日志
docker-compose logs idsgnews
```

## 总结

通过添加 scripts 目录的 volume 挂载，您现在可以：

- ✅ 在服务器上直接修改 `scripts/settings.json`
- ✅ 使用 `docker-compose down && docker-compose up -d` 快速重启
- ✅ 无需重新构建镜像，节省大量时间
- ✅ 支持实时配置更新和测试

这样就解决了您的问题：**更新配置文件后，只需 down 再 up，无需重新 build！**