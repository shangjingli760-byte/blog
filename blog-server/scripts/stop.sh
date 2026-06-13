#!/bin/bash
# Blog 服务停止脚本，注册为 Hermes 命令

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$APP_DIR/blog-server.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "PID 文件不存在，服务可能未在运行"
    exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
    echo "正在停止服务 (PID: $PID)..."
    kill "$PID"
    sleep 2
    if kill -0 "$PID" 2>/dev/null; then
        echo "强制停止..."
        kill -9 "$PID"
    fi
    rm -f "$PID_FILE"
    echo "服务已停止"
else
    echo "进程 $PID 不存在，清理 PID 文件"
    rm -f "$PID_FILE"
fi
