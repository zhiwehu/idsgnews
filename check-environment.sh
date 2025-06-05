#!/bin/bash

# 环境检查脚本
# 在部署前运行此脚本检查服务器环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查结果统计
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS_COUNT++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARN_COUNT++))
}

# 检查函数
check_os() {
    log_info "检查操作系统..."
    
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        log_pass "操作系统: $PRETTY_NAME"
        
        # 检查是否为支持的系统
        case $ID in
            ubuntu|debian)
                if [[ $(echo "$VERSION_ID >= 18.04" | bc -l) -eq 1 ]] 2>/dev/null || [[ $VERSION_ID == "18.04" ]] || [[ $VERSION_ID > "18.04" ]]; then
                    log_pass "Ubuntu/Debian 版本支持"
                else
                    log_warn "建议使用 Ubuntu 18.04+ 或 Debian 10+"
                fi
                ;;
            centos|rhel)
                if [[ $VERSION_ID -ge 7 ]] 2>/dev/null; then
                    log_pass "CentOS/RHEL 版本支持"
                else
                    log_warn "建议使用 CentOS 7+ 或 RHEL 7+"
                fi
                ;;
            *)
                log_warn "未测试的操作系统，可能需要手动调整"
                ;;
        esac
    else
        log_fail "无法识别操作系统"
    fi
    
    # 检查架构
    ARCH=$(uname -m)
    case $ARCH in
        x86_64|amd64)
            log_pass "系统架构: $ARCH (支持)"
            ;;
        aarch64|arm64)
            log_pass "系统架构: $ARCH (支持)"
            ;;
        *)
            log_warn "系统架构: $ARCH (未测试)"
            ;;
    esac
}

check_root() {
    log_info "检查用户权限..."
    
    if [[ $EUID -eq 0 ]]; then
        log_pass "当前用户具有 root 权限"
    else
        log_fail "需要 root 权限运行部署脚本"
        echo "       请使用 'sudo $0' 运行此脚本"
    fi
}

check_memory() {
    log_info "检查内存..."
    
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    AVAIL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    
    if [[ $TOTAL_MEM -ge 1024 ]]; then
        log_pass "总内存: ${TOTAL_MEM}MB (充足)"
    elif [[ $TOTAL_MEM -ge 512 ]]; then
        log_warn "总内存: ${TOTAL_MEM}MB (最低要求)"
    else
        log_fail "总内存: ${TOTAL_MEM}MB (不足，建议至少 512MB)"
    fi
    
    if [[ $AVAIL_MEM -ge 256 ]]; then
        log_pass "可用内存: ${AVAIL_MEM}MB (充足)"
    else
        log_warn "可用内存: ${AVAIL_MEM}MB (可能不足)"
    fi
}

check_disk() {
    log_info "检查磁盘空间..."
    
    DISK_USAGE=$(df / | awk 'NR==2 {print $4}')
    DISK_AVAIL_GB=$((DISK_USAGE / 1024 / 1024))
    
    if [[ $DISK_AVAIL_GB -ge 5 ]]; then
        log_pass "可用磁盘空间: ${DISK_AVAIL_GB}GB (充足)"
    elif [[ $DISK_AVAIL_GB -ge 2 ]]; then
        log_warn "可用磁盘空间: ${DISK_AVAIL_GB}GB (最低要求)"
    else
        log_fail "可用磁盘空间: ${DISK_AVAIL_GB}GB (不足，建议至少 2GB)"
    fi
}

check_network() {
    log_info "检查网络连接..."
    
    # 检查互联网连接
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log_pass "互联网连接正常"
    else
        log_fail "无法连接到互联网"
    fi
    
    # 检查 DNS 解析
    if nslookup google.com &> /dev/null; then
        log_pass "DNS 解析正常"
    else
        log_fail "DNS 解析失败"
    fi
    
    # 检查常用端口
    for port in 80 443; do
        if netstat -tlnp 2>/dev/null | grep ":$port " &> /dev/null; then
            log_warn "端口 $port 已被占用"
        else
            log_pass "端口 $port 可用"
        fi
    done
}

check_package_manager() {
    log_info "检查包管理器..."
    
    if command -v apt-get &> /dev/null; then
        log_pass "包管理器: apt-get (支持)"
        
        # 检查是否可以更新包列表
        if apt-get update &> /dev/null; then
            log_pass "包列表更新成功"
        else
            log_warn "包列表更新失败，可能需要检查软件源"
        fi
    elif command -v yum &> /dev/null; then
        log_pass "包管理器: yum (支持)"
    elif command -v dnf &> /dev/null; then
        log_pass "包管理器: dnf (支持)"
    else
        log_fail "未找到支持的包管理器 (apt-get/yum/dnf)"
    fi
}

check_existing_software() {
    log_info "检查已安装软件..."
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_warn "Node.js 已安装: $NODE_VERSION (将被覆盖)"
    else
        log_pass "Node.js 未安装 (将自动安装)"
    fi
    
    # 检查 Python3
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        log_pass "Python3 已安装: $PYTHON_VERSION"
    else
        log_pass "Python3 未安装 (将自动安装)"
    fi
    
    # 检查 Nginx
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
        log_warn "Nginx 已安装: $NGINX_VERSION (配置将被修改)"
    else
        log_pass "Nginx 未安装 (将自动安装)"
    fi
    
    # 检查 Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        log_pass "Git 已安装: $GIT_VERSION"
    else
        log_pass "Git 未安装 (将自动安装)"
    fi
}

check_firewall() {
    log_info "检查防火墙状态..."
    
    # 检查 ufw
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(ufw status | head -1 | awk '{print $2}')
        if [[ $UFW_STATUS == "active" ]]; then
            log_warn "UFW 防火墙已启用，需要开放 HTTP/HTTPS 端口"
        else
            log_pass "UFW 防火墙未启用"
        fi
    fi
    
    # 检查 iptables
    if command -v iptables &> /dev/null; then
        IPTABLES_RULES=$(iptables -L | wc -l)
        if [[ $IPTABLES_RULES -gt 8 ]]; then
            log_warn "检测到 iptables 规则，可能需要手动配置端口"
        else
            log_pass "iptables 规则较少"
        fi
    fi
}

check_selinux() {
    log_info "检查 SELinux 状态..."
    
    if command -v getenforce &> /dev/null; then
        SELINUX_STATUS=$(getenforce)
        case $SELINUX_STATUS in
            Enforcing)
                log_warn "SELinux 处于强制模式，可能需要额外配置"
                ;;
            Permissive)
                log_warn "SELinux 处于宽松模式"
                ;;
            Disabled)
                log_pass "SELinux 已禁用"
                ;;
        esac
    else
        log_pass "SELinux 未安装"
    fi
}

check_systemd() {
    log_info "检查 systemd..."
    
    if command -v systemctl &> /dev/null; then
        log_pass "systemd 可用"
        
        # 检查是否可以管理服务
        if systemctl list-units &> /dev/null; then
            log_pass "systemctl 工作正常"
        else
            log_warn "systemctl 可能无法正常工作"
        fi
    else
        log_fail "systemd 不可用，需要手动管理服务"
    fi
}

# 显示总结
show_summary() {
    echo
    echo "=== 环境检查总结 ==="
    echo -e "${GREEN}通过: $PASS_COUNT${NC}"
    echo -e "${YELLOW}警告: $WARN_COUNT${NC}"
    echo -e "${RED}失败: $FAIL_COUNT${NC}"
    echo
    
    if [[ $FAIL_COUNT -eq 0 ]]; then
        if [[ $WARN_COUNT -eq 0 ]]; then
            echo -e "${GREEN}✅ 环境检查完全通过，可以开始部署！${NC}"
        else
            echo -e "${YELLOW}⚠️  环境基本满足要求，但有一些警告需要注意${NC}"
        fi
        echo
        echo "运行部署命令:"
        echo "sudo ./deploy.sh"
    else
        echo -e "${RED}❌ 环境检查失败，请解决上述问题后重试${NC}"
        echo
        echo "常见解决方案:"
        echo "1. 确保以 root 权限运行: sudo $0"
        echo "2. 检查网络连接和 DNS 设置"
        echo "3. 释放磁盘空间或增加内存"
        echo "4. 更新操作系统到支持的版本"
    fi
}

# 主函数
main() {
    echo "=== 服务器环境检查 ==="
    echo "检查服务器是否满足部署要求..."
    echo
    
    check_os
    check_root
    check_memory
    check_disk
    check_network
    check_package_manager
    check_existing_software
    check_firewall
    check_selinux
    check_systemd
    
    show_summary
}

# 执行主函数
main "$@"