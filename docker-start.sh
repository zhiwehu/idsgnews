#!/bin/bash

# Docker 快速启动脚本
# 用于一键部署新闻抓取系统

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        echo "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "安装指南: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log_success "Docker 和 Docker Compose 已安装"
}

# 检查 Docker 服务是否运行
check_docker_service() {
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
    
    log_success "Docker 服务运行正常"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    mkdir -p data logs
    
    log_success "目录创建完成"
}

# 选择部署模式
select_deployment_mode() {
    echo
    echo "请选择部署模式:"
    echo "1) 简单模式 (推荐新手)"
    echo "2) 完整模式 (包含所有功能)"
    echo "3) 自定义模式 (使用现有配置)"
    echo
    
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            COMPOSE_FILE="docker-compose.simple.yml"
            log_info "选择简单模式部署"
            ;;
        2)
            COMPOSE_FILE="docker-compose.yml"
            log_info "选择完整模式部署"
            ;;
        3)
            COMPOSE_FILE="docker-compose.yml"
            log_info "使用自定义配置部署"
            ;;
        *)
            log_warn "无效选择，使用简单模式"
            COMPOSE_FILE="docker-compose.simple.yml"
            ;;
    esac
}

# 检查端口占用
check_ports() {
    log_info "检查端口占用..."
    
    if lsof -i :8090 &> /dev/null; then
        log_warn "端口 8090 已被占用，可能会导致冲突"
        read -p "是否继续部署? (y/N): " continue_deploy
        if [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    else
        log_success "端口 8090 可用"
    fi
}

# 构建和启动容器
deploy_containers() {
    log_info "开始构建和部署容器..."
    
    # 停止现有容器（如果存在）
    docker compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # 构建并启动容器
    docker compose -f $COMPOSE_FILE up -d --build
    
    if [ $? -eq 0 ]; then
        log_success "容器部署成功"
    else
        log_error "容器部署失败"
        exit 1
    fi
}

# 等待服务启动
wait_for_service() {
    log_info "等待服务启动..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8090/ &> /dev/null; then
            log_success "服务启动成功"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    echo
    log_warn "服务启动超时，请检查日志"
    return 1
}

# 显示部署结果
show_result() {
    echo
    echo "=== 🎉 部署完成 ==="
    echo
    log_success "新闻抓取系统已成功部署！"
    echo
    echo "📊 访问地址: http://localhost:8090"
    echo "🗄️  数据目录: ./data"
    echo "📝 日志目录: ./logs"
    echo
    echo "常用命令:"
    echo "  查看日志: docker compose -f $COMPOSE_FILE logs -f"
    echo "  停止服务: docker compose -f $COMPOSE_FILE stop"
    echo "  重启服务: docker compose -f $COMPOSE_FILE restart"
    echo "  删除服务: docker compose -f $COMPOSE_FILE down"
    echo
    
    # 显示容器状态
    log_info "容器状态:"
    docker compose -f $COMPOSE_FILE ps
}

# 主函数
main() {
    echo "=== 🚀 IDSGNews Docker 部署脚本 ==="
    echo
    
    # 检查环境
    check_docker
    check_docker_service
    
    # 准备部署
    create_directories
    select_deployment_mode
    check_ports
    
    # 执行部署
    deploy_containers
    
    # 等待服务启动
    if wait_for_service; then
        show_result
    else
        echo
        log_error "部署可能存在问题，请检查日志:"
        echo "docker compose -f $COMPOSE_FILE logs"
    fi
}

# 信号处理
trap 'echo; log_info "部署已中断"; exit 1' INT TERM

# 执行主函数
main "$@"