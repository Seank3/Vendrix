# Frontend dashboard scaffold (React + Vite)

## Prerequisites

### Linux Setup (if Node.js not installed)

```bash
# 1️⃣ Download Node.js LTS Linux tarball (x64)
wget https://nodejs.org/dist/v20.6.0/node-v20.6.0-linux-x64.tar.xz -O node.tar.xz

# 2️⃣ Extract the tarball
tar -xf node.tar.xz

# 3️⃣ Add Node.js and npm to PATH for this session
export PATH=$PWD/node-v20.6.0-linux-x64/bin:$PATH

# 4️⃣ Verify Node.js and npm
node -v
npm -v
```

**Note:** To make Node.js available permanently, add the export line to your `~/.bashrc` or `~/.profile`:
```bash
echo 'export PATH=$PATH:/path/to/node-v20.6.0-linux-x64/bin' >> ~/.bashrc
source ~/.bashrc
```

### Windows Setup (if Node.js not installed)

**Option 1: Using winget (Windows Package Manager - Recommended)**
```powershell
# Install Node.js LTS using winget
winget install OpenJS.NodeJS.LTS
```

**Option 2: Using Chocolatey**
```powershell
# If you have Chocolatey installed
choco install nodejs-lts
```

**Option 3: Manual Download & Install**
1. Download the Windows installer from [nodejs.org](https://nodejs.org/) (LTS version)
2. Run the `.msi` installer and follow the setup wizard
3. Restart your terminal/PowerShell after installation

**Option 4: Portable ZIP (No Installer)**
```powershell
# Download Node.js portable ZIP
# PowerShell (run in frontend folder)
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.6.0/node-v20.6.0-win-x64.zip" -OutFile "node.zip"
Expand-Archive -Path "node.zip" -DestinationPath "."
$env:PATH = "$PWD\node-v20.6.0-win-x64;$env:PATH"

# Verify installation
node -v
npm -v
```

**Verify Installation:**
```powershell
node -v
npm -v
```

### Mac Setup

**Option 1: Using Homebrew**
```bash
brew install node@20
```

**Option 2: Download Installer**
Download and install Node.js LTS from [nodejs.org](https://nodejs.org/).

## Quick start

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the dev server (Vite)
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` requests to the Django backend at `http://localhost:8000`.

**Important:** Make sure the Django backend is running before starting the frontend.

## Included views (placeholders)
- Integrations list with enabled/disabled flags
- Orders table (sample data)
- Config snapshot viewer
- Credentials modal form (JSON input)
- Login page stub

## Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Next steps
- Add real auth (JWT/session) and protect routes.
- Replace sample orders/logs with real data from the backend.
- Add forms for per-platform config and validation errors.

