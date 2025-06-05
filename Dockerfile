# 使用官方 Node.js 18 镜像作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 Nginx 提供静态文件服务
FROM nginx:alpine AS production

# 安装 Python3 和相关依赖用于新闻抓取
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-requests \
    py3-beautifulsoup4 \
    dcron \
    bash \
    curl

# 创建应用目录
RUN mkdir -p /app/scripts /app/public /app/logs

# 从构建阶段复制构建好的文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Python 脚本和配置
COPY scripts/ /app/scripts/
COPY public/ /app/public/

# 安装 Python 依赖
RUN cd /app/scripts && pip3 install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 创建软链接，让 Nginx 能访问数据库文件
RUN ln -sf /app/public/news.db /usr/share/nginx/html/news.db

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# 复制启动脚本
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 复制定时任务配置
COPY docker/crontab /etc/crontabs/root

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R root:root /app \
    && chmod 755 /app/scripts/*.py

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 启动脚本
ENTRYPOINT ["/entrypoint.sh"]