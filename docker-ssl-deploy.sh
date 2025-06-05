#!/bin/bash

# SSL部署脚本 - 使用Let's Encrypt和Certbot自动获取SSL证书

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的环境
check_requirements() {
    log_info "检查部署环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 获取用户输入
get_user_input() {
    log_info "配置SSL证书信息..."
    
    # 获取域名
    read -p "请输入您的域名 (例如: example.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        log_error "域名不能为空"
        exit 1
    fi
    
    # 获取邮箱
    read -p "请输入您的邮箱地址 (用于Let's Encrypt通知): " EMAIL
    if [[ -z "$EMAIL" ]]; then
        log_error "邮箱地址不能为空"
        exit 1
    fi
    
    # 询问是否使用staging环境
    read -p "是否使用Let's Encrypt测试环境? (推荐首次部署时使用) [y/N]: " USE_STAGING
    
    log_success "配置信息收集完成"
    log_info "域名: $DOMAIN"
    log_info "邮箱: $EMAIL"
    log_info "测试环境: ${USE_STAGING:-N}"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p certbot/conf
    mkdir -p certbot/www
    mkdir -p certbot/logs
    mkdir -p data
    mkdir -p logs
    
    log_success "目录创建完成"
}

# 更新配置文件
update_config() {
    log_info "更新配置文件..."
    
    # 更新docker-compose.yml中的域名和邮箱
    if [[ "$USE_STAGING" =~ ^[Yy]$ ]]; then
        STAGING_FLAG="--staging"
    else
        STAGING_FLAG=""
    fi
    
    # 更新docker-compose.yml
    sed -i.bak "s/your-email@example.com/$EMAIL/g" docker-compose.yml
    sed -i.bak "s/your-domain.com/$DOMAIN/g" docker-compose.yml
    
    if [[ "$USE_STAGING" =~ ^[Yy]$ ]]; then
        sed -i.bak "s/--agree-tos --no-eff-email/--agree-tos --no-eff-email --staging/g" docker-compose.yml
    else
        sed -i.bak "s/--agree-tos --no-eff-email --staging/--agree-tos --no-eff-email/g" docker-compose.yml
    fi
    
    # 更新nginx-ssl.conf
    sed -i.bak "s/your-domain.com/$DOMAIN/g" docker/nginx-ssl.conf
    
    log_success "配置文件更新完成"
}

# 初始化SSL证书
init_ssl() {
    log_info "初始化SSL证书..."
    
    # 首先启动应用以便certbot可以验证域名
    log_info "启动应用服务..."
    docker-compose up -d idsgnews
    
    # 等待服务启动
    sleep 10
    
    # 运行certbot获取证书
    log_info "获取SSL证书..."
    docker-compose run --rm certbot
    
    if [ $? -eq 0 ]; then
        log_success "SSL证书获取成功"
    else
        log_error "SSL证书获取失败，请检查域名DNS设置"
        exit 1
    fi
}

# 重启服务以应用SSL配置
restart_services() {
    log_info "重启服务以应用SSL配置..."
    
    docker-compose down
    docker-compose up -d
    
    log_success "服务重启完成"
}

# 设置证书自动续期
setup_auto_renewal() {
    log_info "设置证书自动续期..."
    
    # 创建续期脚本
    cat > certbot-renew.sh << 'EOF'
#!/bin/bash

# SSL证书自动续期脚本

set -e

log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1"
}

cd "$(dirname "$0")"

log_info "开始检查SSL证书续期..."

# 尝试续期证书
if docker-compose run --rm certbot renew --quiet; then
    log_info "证书续期检查完成"
    
    # 重新加载nginx配置
    docker-compose exec idsgnews nginx -s reload
    log_info "Nginx配置已重新加载"
else
    log_error "证书续期失败"
    exit 1
fi

log_info "SSL证书续期任务完成"
EOF
    
    chmod +x certbot-renew.sh
    
    log_success "自动续期脚本创建完成"
    log_info "请将以下命令添加到crontab中以实现自动续期:"
    log_info "0 12 * * * $(pwd)/certbot-renew.sh >> $(pwd)/logs/certbot-renew.log 2>&1"
}

# 显示部署结果
show_result() {
    log_success "SSL部署完成！"
    echo
    log_info "访问地址:"
    log_info "  HTTP:  http://$DOMAIN (将自动重定向到HTTPS)"
    log_info "  HTTPS: https://$DOMAIN"
    echo
    log_info "管理命令:"
    log_info "  查看服务状态: docker-compose ps"
    log_info "  查看日志: docker-compose logs -f"
    log_info "  停止服务: docker-compose down"
    log_info "  重启服务: docker-compose restart"
    log_info "  手动续期证书: ./certbot-renew.sh"
    echo
    log_warning "重要提示:"
    log_warning "1. 请确保域名DNS已正确指向此服务器"
    log_warning "2. 请将自动续期命令添加到crontab中"
    log_warning "3. 如果使用了测试证书，请在确认无误后重新运行脚本获取正式证书"
}

# 主函数
main() {
    echo "=== 新闻抓取系统 SSL 部署脚本 ==="
    echo
    
    check_requirements
    get_user_input
    create_directories
    update_config
    init_ssl
    restart_services
    setup_auto_renewal
    show_result
}

# 运行主函数
main "$@"