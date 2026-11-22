#!/bin/bash

# Exit immediately on error, treat unset variables as an error, and fail if any command in a pipeline fails.
set -euo pipefail

# Function to run a command and show logs only on error
run_command() {
    local command_to_run="$*"
    local output
    local exit_code
    
    # Capture all output (stdout and stderr)
    output=$(eval "$command_to_run" 2>&1) || exit_code=$?
    exit_code=${exit_code:-0}
    
    if [ $exit_code -ne 0 ]; then
        echo -e "\033[0;31m[ERROR] Command failed (Exit Code $exit_code): $command_to_run\033[0m" >&2
        echo -e "\033[0;31m$output\033[0m" >&2
        
        exit $exit_code
    fi
}

# Fixing permissions on folders that are mounted as volumes
# This is necessary because Docker creates these folders with root ownership by default,
# which leads to permission issues when the container user (node) tries to access them.

echo -e "\n⚙️ Fixing permissions on 'node_modules' folder..."
run_command "sudo chown -R node:node node_modules"

echo -e "\n⚙️ Fixing permissions on AI agents' config folders..."
run_command "sudo chown -R node:node ~/.cache"
run_command "sudo chown -R node:node ~/.claude"
echo "✅ Done"

# Installing project's dependencies

echo -e "\n📦 Installing PNPM dependencies..."
if [ -f pnpm-lock.yaml ]; then
  run_command "pnpm install --frozen-lockfile"
elif [ -f package.json ]; then
  run_command "pnpm install"
fi
echo "✅ Done"

echo -e "\n🤖 Installing Claude CLI..."
run_command "curl -fsSL https://claude.ai/install.sh | bash"
echo "✅ Done"

echo -e "\n🎨 Installing JetBrains Mono font..."
run_command "curl -fsSL https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/install_manual.sh"
echo "✅ Done"

echo -e "\n🎤 Installing SoX for audio recording (in order to use '/voice' in Claude Code)..."
run_command "sudo apt-get update"
run_command "sudo apt-get install -y sox"
echo "✅ Done"

echo -e "\n💰 Installing RTK (for Tokenomics)..."
run_command "curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh"
run_command "RTK_TELEMETRY_DISABLED=1 rtk init -g --auto-patch" #init for Claude Code
echo "✅ Done"

echo -e "\n🦊 Installing GitLab CLI (glab)..."
run_command "GLAB_URL=\$(curl -fsSLI -o /dev/null -w '%{url_effective}' https://gitlab.com/gitlab-org/cli/-/releases/permalink/latest) && GLAB_VERSION=\${GLAB_URL##*/v} && curl -fsSL -o /tmp/glab.deb \"https://gitlab.com/gitlab-org/cli/-/releases/v\${GLAB_VERSION}/downloads/glab_\${GLAB_VERSION}_linux_\$(dpkg --print-architecture).deb\" && sudo apt-get install -y /tmp/glab.deb && rm -f /tmp/glab.deb"
echo "✅ Done"

# Cleaning up apt cache to reduce image size

echo -e "\n🧹 Cleaning cache..."
run_command "sudo apt-get autoclean"
run_command "sudo apt-get clean"

# Setting up useful shell aliases
echo -e "\n🔧 Setting up shell aliases..."
{
  echo ""
  echo "# Useful aliases added by devcontainer setup"
  echo "alias ll='ls -la'"
  echo "alias cl='claude'"
  echo "alias cc='claude --continue'"
  echo "alias cr='claude --resume'"
  echo "alias cch='claude --chrome'"
} >> ~/.bashrc
echo "✅ Done"

echo "✅ Setup completed. Happy coding! 🚀"
echo
echo 
echo "------------------------------------------------------------------------------"
echo "⏭️ Recommended next steps: "
echo "   - Run 'pnpm dev' and open http://localhost:4321"
echo "   - Read CLAUDE.md and CONTRIBUTING.md for the conventions."
echo "------------------------------------------------------------------------------"
