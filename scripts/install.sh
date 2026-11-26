#!/usr/bin/env bash
set -euo pipefail

# report-helper 一键安装脚本：支持 Claude Code / Cursor / Codex / Antigravity / WorkBuddy
REPO_URL="https://github.com/Maijintao/report-helper.git"
SKILL_NAME="report-helper"
TARGET="${1:-}"

if [ -z "$TARGET" ]; then
  if [ -d "$HOME/.claude" ]; then
    TARGET="$HOME/.claude/skills/$SKILL_NAME"
  elif [ -d "$HOME/.cursor" ]; then
    TARGET="$HOME/.cursor/skills/$SKILL_NAME"
  elif [ -d "$HOME/.codex" ]; then
    TARGET="$HOME/.codex/skills/$SKILL_NAME"
  elif [ -d "$HOME/.gemini/antigravity" ]; then
    TARGET="$HOME/.gemini/antigravity/skills/$SKILL_NAME"
  elif [ -d "$HOME/.workbuddy-ai" ]; then
    TARGET="$HOME/.workbuddy-ai/skills/$SKILL_NAME"
  else
    TARGET="$HOME/.agents/skills/$SKILL_NAME"
  fi
fi

mkdir -p "$(dirname "$TARGET")"

if [ -d "$TARGET/.git" ]; then
  echo "检测到已有安装，正在更新 $TARGET ..."
  git -C "$TARGET" pull --ff-only
else
  echo "正在安装 $SKILL_NAME 到 $TARGET ..."
  git clone --depth 1 "$REPO_URL" "$TARGET"
fi

echo "安装完成：$TARGET"
echo "现在可以直接在你的 AI Agent 中说：「把这份资料做成杂志手绘风汇报页和 8 分钟逐字稿」"
