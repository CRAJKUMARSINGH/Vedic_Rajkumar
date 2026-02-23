# Batch Files Guide - Windows Quick Start

## 🚀 Quick Start for Windows Users

Double-click any `.bat` file to run it!

---

## 📋 Available Batch Files

### 🎯 START_HERE.bat (MAIN MENU)
**The easiest way to use the app!**

Double-click this file to see an interactive menu with all options:
```
1. Install Dependencies
2. Start Development Server
3. Build for Production
4. Preview Production Build
5. Run Tests
6. Deploy to Vercel
7. Clean Project
8. Open Documentation
9. Exit
```

**Recommended for beginners!**

---

## 🔧 Individual Batch Files

### 1. install.bat
**Install all dependencies**

```
What it does:
- Checks if Node.js is installed
- Removes old node_modules
- Installs fresh dependencies
- Shows success/error message

When to use:
- First time setup
- After pulling new code
- When dependencies are corrupted
```

**Usage**: Double-click `install.bat`

---

### 2. run-dev.bat
**Start development server**

```
What it does:
- Installs dependencies (if needed)
- Starts Vite dev server
- Opens on http://localhost:8080
- Enables hot reload

When to use:
- During development
- Testing features
- Making changes to code
```

**Usage**: Double-click `run-dev.bat`

**Stop server**: Press `Ctrl+C` in the window

---

### 3. run-build.bat
**Build for production**

```
What it does:
- Installs dependencies (if needed)
- Creates optimized production build
- Outputs to dist/ folder
- Shows build statistics

When to use:
- Before deployment
- Testing production build
- Checking bundle size
```

**Usage**: Double-click `run-build.bat`

**Output**: `dist/` folder

---

### 4. run-preview.bat
**Preview production build**

```
What it does:
- Checks if build exists
- Starts preview server
- Opens on http://localhost:4173
- Tests production build locally

When to use:
- After running run-build.bat
- Before deploying
- Testing production features
```

**Usage**: 
1. Run `run-build.bat` first
2. Then run `run-preview.bat`

**Stop server**: Press `Ctrl+C` in the window

---

### 5. test.bat
**Run test suite**

```
What it does:
- Installs dependencies (if needed)
- Runs all tests
- Shows test results
- Reports pass/fail

When to use:
- Before committing code
- After making changes
- Verifying functionality
```

**Usage**: Double-click `test.bat`

---

### 6. deploy-vercel.bat
**Deploy to Vercel**

```
What it does:
- Checks/installs Vercel CLI
- Shows deployment options:
  1. Preview deployment (test)
  2. Production deployment (live)
  3. Cancel
- Deploys to Vercel

When to use:
- Deploying to Vercel
- Updating live site
- Creating preview deployments
```

**Usage**: Double-click `deploy-vercel.bat`

**Requirements**: 
- Vercel account
- Logged in to Vercel CLI

---

### 7. clean.bat
**Clean project**

```
What it does:
- Removes node_modules
- Removes dist folder
- Removes package-lock.json
- Removes cache files
- Asks for confirmation

When to use:
- Fixing dependency issues
- Starting fresh
- Freeing disk space
- Before reinstalling
```

**Usage**: Double-click `clean.bat`

**Warning**: You'll need to run `install.bat` after this!

---

## 🎯 Common Workflows

### First Time Setup
```
1. Double-click START_HERE.bat
2. Choose option 1 (Install Dependencies)
3. Copy .env.example to .env
4. Edit .env with your Supabase credentials
5. Choose option 2 (Start Development Server)
6. Open http://localhost:8080
```

### Daily Development
```
1. Double-click run-dev.bat
2. Make your changes
3. See changes instantly (hot reload)
4. Press Ctrl+C to stop
```

### Before Deployment
```
1. Double-click run-build.bat
2. Check for errors
3. Double-click run-preview.bat
4. Test the production build
5. If all good, deploy!
```

### Deploy to Vercel
```
Method 1 (Dashboard):
1. Go to https://vercel.com
2. Import repository
3. Add environment variables
4. Click Deploy

Method 2 (CLI):
1. Double-click deploy-vercel.bat
2. Choose option 2 (Production)
3. Confirm deployment
4. Wait for completion
```

### Fix Issues
```
If something is broken:
1. Double-click clean.bat
2. Confirm cleanup
3. Double-click install.bat
4. Double-click run-dev.bat
```

---

## 🔍 Troubleshooting

### "Node.js is not installed"
```
Solution:
1. Download Node.js from https://nodejs.org
2. Install Node.js (version 18 or higher)
3. Restart your computer
4. Run install.bat again
```

### "npm is not installed"
```
Solution:
npm comes with Node.js. If you see this error:
1. Reinstall Node.js
2. Make sure to check "Add to PATH" during installation
3. Restart your computer
```

### "Build not found" (run-preview.bat)
```
Solution:
1. Run run-build.bat first
2. Wait for build to complete
3. Then run run-preview.bat
```

### "Port already in use"
```
Solution:
1. Close any running dev servers
2. Check if another app is using port 8080
3. Or change port in vite.config.ts
```

### Dependencies won't install
```
Solution:
1. Run clean.bat
2. Delete node_modules manually if needed
3. Run install.bat again
4. Check your internet connection
```

---

## 📝 Environment Variables

Before running the app, you need to set up environment variables:

### Step 1: Copy .env.example
```
1. Find .env.example in project folder
2. Copy it
3. Rename copy to .env
```

### Step 2: Edit .env
```
Open .env in Notepad and add your Supabase credentials:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Step 3: Get Supabase Credentials
```
1. Go to https://supabase.com
2. Open your project
3. Go to Settings > API
4. Copy URL and anon key
5. Paste into .env file
```

---

## 🎨 Customizing Batch Files

All batch files are simple text files. You can edit them with Notepad:

```
1. Right-click any .bat file
2. Choose "Edit"
3. Make your changes
4. Save and close
```

### Example: Change Port
Edit `run-dev.bat` and change the port message:
```batch
echo Starting development server on http://localhost:8080
```

---

## 🚀 Quick Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **START_HERE.bat** | Main menu | Always start here! |
| **install.bat** | Install deps | First time, after updates |
| **run-dev.bat** | Dev server | During development |
| **run-build.bat** | Build prod | Before deployment |
| **run-preview.bat** | Preview prod | Test before deploy |
| **test.bat** | Run tests | Before committing |
| **deploy-vercel.bat** | Deploy | Push to production |
| **clean.bat** | Clean project | Fix issues |

---

## 💡 Pro Tips

1. **Use START_HERE.bat** - It's the easiest way!
2. **Keep terminal open** - Don't close the black window while server is running
3. **Read error messages** - They usually tell you what's wrong
4. **Run clean.bat** - When things get weird
5. **Check .env file** - Most issues are missing environment variables

---

## 🆘 Getting Help

If batch files don't work:

1. **Check Node.js**: Run `node --version` in Command Prompt
2. **Check npm**: Run `npm --version` in Command Prompt
3. **Read error messages**: They usually explain the problem
4. **Try clean install**: Run clean.bat then install.bat
5. **Check documentation**: See README.md and other docs

---

## 📚 Additional Resources

- **README.md** - Project overview
- **DEPLOYMENT_GUIDE.md** - Full deployment guide
- **VERCEL_DEPLOY.md** - Vercel-specific instructions
- **DEPLOYMENT_STATUS.md** - Current deployment status

---

## 🎉 You're Ready!

Double-click **START_HERE.bat** to begin!

**Happy coding!** 🚀

---

**Note**: These batch files are for Windows only. Mac/Linux users should use the npm commands directly in terminal.
