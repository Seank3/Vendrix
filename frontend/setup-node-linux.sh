#!/bin/bash
# Quick setup script for Node.js on Linux (x64)
# Downloads and sets up Node.js LTS in the current directory

set -e

NODE_VERSION="v20.6.0"
NODE_DIR="node-${NODE_VERSION}-linux-x64"
TARBALL="${NODE_DIR}.tar.xz"
NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${TARBALL}"

echo "📦 Downloading Node.js ${NODE_VERSION}..."
wget "${NODE_URL}" -O "${TARBALL}"

echo "📂 Extracting..."
tar -xf "${TARBALL}"

echo "✅ Node.js extracted to ${NODE_DIR}/"
echo ""
echo "To use Node.js in this session, run:"
echo "  export PATH=\$PWD/${NODE_DIR}/bin:\$PATH"
echo ""
echo "To make it permanent, add to ~/.bashrc:"
echo "  export PATH=\$PATH:\$(pwd)/${NODE_DIR}/bin"
echo ""
echo "Verifying installation..."
export PATH="$PWD/${NODE_DIR}/bin:$PATH"
node -v
npm -v

echo ""
echo "✅ Setup complete! Now run:"
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"

