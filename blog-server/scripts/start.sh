#!/bin/bash
# Blog 服务启动脚本，注册为 Hermes 命令
#
# 使用方式：
#   bash start.sh          # 前台启动
#   bash start.sh -d       # 后台启动

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="blog-server"
PID_FILE="$APP_DIR/$APP_NAME.pid"
LOG_DIR="/var/log/blog"
LOG_FILE="$LOG_DIR/app.log"
PORT="${PORT:-8080}"
DB_PATH="${DB_PATH:-$APP_DIR/data/blog.db}"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "服务已在运行 (PID: $PID)"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# 编译
echo "正在编译 $APP_NAME..."
if [ ! -f "$APP_DIR/$APP_NAME" ] || [ "$APP_DIR/main.go" -nt "$APP_DIR/$APP_NAME" ]; then
    cd "$APP_DIR"
    go build -o "$APP_NAME" .
    echo "编译完成"
fi

export PORT
export DB_PATH

if [ "$1" = "-d" ]; then
    # 后台启动
    nohup "$APP_DIR/$APP_NAME" >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "服务已在后台启动 (PID: $(cat $PID_FILE))"
    echo "日志文件: $LOG_FILE"
else
    # 前台启动
    echo "服务启动中 (PORT=$PORT)..."
    "$APP_DIR/$APP_NAME"
fi
