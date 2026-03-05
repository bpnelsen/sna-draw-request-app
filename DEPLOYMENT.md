# Deployment Guide - SNA Draw Request Reorganizer

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Sign in to Vercel** - https://vercel.com
2. **Click "Import Project"**
3. **Paste GitHub URL** - (once you push to GitHub)
4. **Configure Environment** - None required!
5. **Deploy** - Click Deploy

Vercel auto-deploys on every push to main branch.

---

### Option 2: Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /data/.openclaw/workspace/sna-draw-request-app
vercel deploy

# Deploy to production
vercel deploy --prod
```

---

## 📊 GitHub Setup

### Create New Repository

1. Go to https://github.com/new
2. **Repository name:** `sna-draw-request-app`
3. **Description:** "SNA Draw Request Excel Reorganizer"
4. **Public** (for team access)
5. **Create repository**

### Push Existing Code

```bash
cd /data/.openclaw/workspace/sna-draw-request-app

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/sna-draw-request-app.git

# Rename branch
git branch -M main

# Push
git push -u origin main
```

---

## 🔧 Python Script Setup

The app needs the Python script to run on your VPS for processing files.

### Step 1: Copy Python Script to VPS

```bash
mkdir -p /data/.openclaw/workspace/sna-script
cp reorganize_sna_draw_request.py /data/.openclaw/workspace/sna-script/
```

### Step 2: Install Python Dependencies

```bash
# Install openpyxl and pandas
pip3 install openpyxl pandas
```

### Step 3: Test Script

```bash
python3 /data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py test_input.xlsx test_output.xlsx
```

---

## 🌍 Environment Variables

### Local Development

No environment variables needed!

### Production (Vercel)

Create `.env.production` or set in Vercel dashboard:

```
# Optional: API endpoint for Python processing
PYTHON_API_URL=your_vps_endpoint
```

---

## 📁 File Storage

### Local Development

Files stored in:
- **Uploads:** `public/uploads/`
- **Results:** `public/results/`
- **History:** `data/history.json`

### Production (Vercel)

⚠️ **Important:** Vercel deployments are ephemeral!

**Solutions:**
1. **AWS S3** - For long-term file storage
2. **Supabase Storage** - For cloud storage
3. **SharePoint** - For team document management

**Current setup:** Uses temporary `public/` folder (files deleted after deployment)

---

## 🔐 Security Checklist

- [ ] GitHub repo is private (if sensitive data)
- [ ] Python script is only on VPS (not in repo)
- [ ] Upload file size limits configured
- [ ] Valid Excel format validation enabled
- [ ] Error messages don't expose system paths

---

## 📊 Monitoring

### Vercel Dashboard

- Monitor deployments: https://vercel.com/bpnelsen
- Check logs: Deployments → Function logs
- Track errors: Monitoring → Error tracking

### Local Logs

```bash
# Development logs
npm run dev

# Production logs (after deploy)
vercel logs
```

---

## 🚨 Troubleshooting

### "Python script not found"

```bash
# Verify script exists
ls -la /data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py

# Check permissions
chmod +x /data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py
```

### "File not downloading"

- Files in `public/results/` must be accessible
- Use `/results/filename.xlsx` URLs
- Check Vercel deployment logs

### "History not persisting"

- `data/history.json` created automatically
- On Vercel, data only persists during build/deployment
- **Recommended:** Use Supabase for history storage

---

## 📈 Scaling

### For Large Teams

1. **Add authentication** - Login required
2. **Database** - Move history to Supabase
3. **File storage** - Use AWS S3 or Supabase
4. **Queue system** - For concurrent uploads

### Current Limits

- Single file upload at a time
- File size: Vercel default (100MB)
- Python processing: Must complete within timeout

---

## 🔄 CI/CD Pipeline

### Automatic Tests (Optional)

```bash
# Add to GitHub Actions
.github/workflows/test.yml
```

### Automatic Deployment

Once you connect GitHub to Vercel:
- Every push to `main` → Auto-deploy
- Pull requests → Preview deployments
- Status checks: Passing ✅

---

## 📞 Support

### Vercel Help

- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com

### Next.js Help

- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

---

## 🎯 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Python script on VPS
- [ ] Dependencies installed (`openpyxl`, `pandas`)
- [ ] Test file upload successful
- [ ] History page loads
- [ ] Download links work
- [ ] Team members can access

---

**Status:** 🚀 Ready to Deploy  
**Last Updated:** 2026-03-04
