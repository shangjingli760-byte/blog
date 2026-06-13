#!/bin/bash
# Blog 服务重启脚本，注册为 Hermes 命令

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "正在重启 Blog 服务..."
bash "$SCRIPT_DIR/stop.sh"
sleep 1
bash "$SCRIPT_DIR/start.sh" -d
