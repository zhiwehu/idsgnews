#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 初始化函数
init_directories() {
    log_info "初始化目录结构..."
    
    # 确保必要目录存在
    mkdir -p /app/public /app/logs /var/log/nginx
    
    # 设置权限
    chown -R nginx:nginx /usr/share/nginx/html
    chmod -R 755 /app/scripts
    
    log_success "目录初始化完成"
}

init_database() {
    log_info "初始化数据库..."
    
    # 如果数据库文件不存在，运行一次新闻抓取来创建
    if [ ! -f "/app/public/news.db" ]; then
        log_info "数据库文件不存在，正在创建..."
        cd /app/scripts
        python3 news_scraper.py || log_warn "初始新闻抓取失败，将在定时任务中重试"
        cd /
    else
        log_success "数据库文件已存在"
    fi
    
    # 确保软链接存在
    if [ ! -L "/usr/share/nginx/html/news.db" ]; then
        ln -sf /app/public/news.db /usr/share/nginx/html/news.db
        log_success "创建数据库软链接"
    fi
}

start_cron() {
    log_info "启动定时任务服务..."
    
    # 启动 crond 服务
    crond -b -l 2
    
    # 验证 cron 是否运行
    if pgrep crond > /dev/null; then
        log_success "定时任务服务启动成功"
    else
        log_error "定时任务服务启动失败"
    fi
}

start_nginx() {
    log_info "启动 Nginx 服务..."
    
    # 测试 Nginx 配置
    nginx -t
    
    if [ $? -eq 0 ]; then
        log_success "Nginx 配置验证通过"
    else
        log_error "Nginx 配置验证失败"
        exit 1
    fi
}

run_initial_scrape() {
    log_info "运行初始新闻抓取..."
    
    cd /app/scripts
    python3 news_scraper.py > /app/logs/initial_scrape.log 2>&1 &
    
    log_success "初始新闻抓取已在后台启动"
}

show_status() {
    echo
    echo "=== 🚀 IDSGNews 容器启动完成 ==="
    echo
    log_success "服务状态:"
    echo "  📊 Web 服务: http://localhost (端口 80)"
    echo "  🗄️  数据库: /app/public/news.db"
    echo "  📝 日志目录: /app/logs"
    echo "  ⏰ 定时任务: 每30分钟抓取新闻"
    echo
    log_info "容器健康检查: curl -f http://localhost/"
    echo
}

# 信号处理函数
handle_signal() {
    log_info "接收到停止信号，正在优雅关闭..."
    
    # 停止 nginx
    nginx -s quit
    
    # 停止 cron
    pkill crond
    
    log_success "服务已停止"
    exit 0
}

# 设置信号处理
trap handle_signal SIGTERM SIGINT

# 主函数
main() {
    log_info "=== 启动 IDSGNews 容器 ==="
    
    # 初始化
    init_directories
    init_database
    
    # 启动服务
    start_cron
    start_nginx
    
    # 运行初始抓取
    run_initial_scrape
    
    # 显示状态
    show_status
    
    # 启动 Nginx（前台运行）
    log_info "启动 Nginx 前台进程..."
    exec nginx -g "daemon off;"
}

# 执行主函数
main "$@"