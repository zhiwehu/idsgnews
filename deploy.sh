#!/bin/bash

# 新闻抓取系统部署脚本
# 适用于 Linux 服务器环境

set -e  # 遇到错误立即退出

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
APP_NAME="idsgnews"
APP_DIR="/opt/${APP_NAME}"
SERVICE_USER="www-data"
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
SYSTEMD_SERVICE="/etc/systemd/system/${APP_NAME}.service"
PORT=3000
DOMAIN="your-domain.com"  # 请修改为您的域名

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        exit 1
    fi
}

# 检查系统环境
check_system() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [[ ! -f /etc/os-release ]]; then
        log_error "无法识别操作系统"
        exit 1
    fi
    
    source /etc/os-release
    log_info "操作系统: $PRETTY_NAME"
    
    # 检查架构
    ARCH=$(uname -m)
    log_info "系统架构: $ARCH"
}

# 安装系统依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    # 更新包管理器
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y curl wget git nginx python3 python3-pip python3-venv sqlite3
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y curl wget git nginx python3 python3-pip sqlite3
    else
        log_error "不支持的包管理器"
        exit 1
    fi
}

# 安装 Node.js
install_nodejs() {
    log_info "安装 Node.js..."
    
    if ! command -v node &> /dev/null; then
        # 安装 Node.js 18.x
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js 版本: $NODE_VERSION"
    log_success "npm 版本: $NPM_VERSION"
}

# 创建应用用户
create_app_user() {
    log_info "创建应用用户..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false $SERVICE_USER
        log_success "创建用户: $SERVICE_USER"
    else
        log_info "用户 $SERVICE_USER 已存在"
    fi
}

# 创建应用目录
setup_app_directory() {
    log_info "设置应用目录..."
    
    # 创建应用目录
    mkdir -p $APP_DIR
    
    # 复制应用文件
    if [[ -d "$(pwd)" ]]; then
        cp -r . $APP_DIR/
        chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
        log_success "应用文件已复制到 $APP_DIR"
    else
        log_error "无法找到应用源码"
        exit 1
    fi
}

# 安装应用依赖
install_app_dependencies() {
    log_info "安装应用依赖..."
    
    cd $APP_DIR
    
    # 安装 Node.js 依赖
    sudo -u $SERVICE_USER npm install
    
    # 安装 Python 依赖
    sudo -u $SERVICE_USER python3 -m pip install --user -r scripts/requirements.txt
    
    log_success "依赖安装完成"
}

# 构建应用
build_app() {
    log_info "构建应用..."
    
    cd $APP_DIR
    sudo -u $SERVICE_USER npm run build
    
    # 创建软链接
    if [[ -f "$APP_DIR/public/news.db" ]]; then
        rm -f $APP_DIR/dist/news.db
        sudo -u $SERVICE_USER ln -s ../public/news.db $APP_DIR/dist/news.db
        log_success "数据库软链接创建成功"
    fi
    
    log_success "应用构建完成"
}

# 配置 systemd 服务
setup_systemd_service() {
    log_info "配置 systemd 服务..."
    
    cat > $SYSTEMD_SERVICE << EOF
[Unit]
Description=IDSGNews Application
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port $PORT
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable $APP_NAME
    log_success "systemd 服务配置完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        proxy_pass http://localhost:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    
    # 测试 Nginx 配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log_success "Nginx 配置完成"
}

# 设置定时任务
setup_cron_job() {
    log_info "设置定时任务..."
    
    # 创建定时抓取脚本
    cat > $APP_DIR/scripts/auto_scrape.sh << 'EOF'
#!/bin/bash
cd /opt/idsgnews/scripts
python3 news_scraper.py >> /var/log/idsgnews_scraper.log 2>&1
EOF

    chmod +x $APP_DIR/scripts/auto_scrape.sh
    chown $SERVICE_USER:$SERVICE_USER $APP_DIR/scripts/auto_scrape.sh
    
    # 添加到 crontab (每小时执行一次)
    (crontab -u $SERVICE_USER -l 2>/dev/null; echo "0 * * * * $APP_DIR/scripts/auto_scrape.sh") | crontab -u $SERVICE_USER -
    
    log_success "定时任务设置完成 (每小时执行一次)"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动应用服务
    systemctl start $APP_NAME
    
    # 检查服务状态
    if systemctl is-active --quiet $APP_NAME; then
        log_success "应用服务启动成功"
    else
        log_error "应用服务启动失败"
        systemctl status $APP_NAME
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo
    echo "=== 部署信息 ==="
    echo "应用目录: $APP_DIR"
    echo "服务用户: $SERVICE_USER"
    echo "应用端口: $PORT"
    echo "域名: $DOMAIN"
    echo
    echo "=== 服务管理命令 ==="
    echo "启动服务: systemctl start $APP_NAME"
    echo "停止服务: systemctl stop $APP_NAME"
    echo "重启服务: systemctl restart $APP_NAME"
    echo "查看状态: systemctl status $APP_NAME"
    echo "查看日志: journalctl -u $APP_NAME -f"
    echo
    echo "=== 手动抓取数据 ==="
    echo "cd $APP_DIR/scripts && python3 news_scraper.py"
    echo
    echo "=== 访问地址 ==="
    echo "http://$DOMAIN"
    echo "http://$(curl -s ifconfig.me):$PORT (如果防火墙允许)"
}

# 主函数
main() {
    log_info "开始部署 $APP_NAME..."
    
    check_root
    check_system
    install_dependencies
    install_nodejs
    create_app_user
    setup_app_directory
    install_app_dependencies
    build_app
    setup_systemd_service
    setup_nginx
    setup_cron_job
    start_services
    show_deployment_info
}

# 执行主函数
main "$@"