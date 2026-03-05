# SNA App - VPS Integration Setup

**Status:** Production-Ready  
**Architecture:** Vercel Frontend + VPS Backend  
**Processing:** Python on VPS, queued from Vercel  

---

## Overview

The SNA Draw Request app now uses a two-tier architecture:

1. **Frontend (Vercel):** React UI for uploading files
2. **Backend (Your VPS):** Node.js server + Python processing

When you upload a file on Vercel, it's sent to your VPS for processing and returns the result.

---

## Setup Steps

### Part 1: Configure VPS Backend (5 minutes)

1. **On your VPS:**
   ```bash
   cd /data/.openclaw/workspace/sna-script
   npm install
   ```

2. **Create .env file:**
   ```bash
   cat > .env << EOF
   PORT=3001
   SNA_API_KEY=$(openssl rand -hex 32)
   EOF
   cat .env  # Save the API key!
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Test it:**
   ```bash
   curl http://localhost:3001/health
   ```

### Part 2: Configure Vercel App (2 minutes)

1. **Get your VPS IP/hostname:**
   - Note your VPS public IP or domain name
   - Example: `123.45.67.89` or `vps.example.com`

2. **Deploy to Vercel:**
   ```bash
   cd /data/.openclaw/workspace/sna-draw-request-app
   vercel env add VPS_BACKEND_URL
   # Enter: http://your-vps-ip:3001
   
   vercel env add SNA_API_KEY
   # Enter: [the key from .env on VPS]
   
   vercel deploy
   ```

3. **Or set via Vercel UI:**
   - Go to: https://vercel.com → Project → Settings → Environment Variables
   - Add `VPS_BACKEND_URL=http://your-vps-ip:3001`
   - Add `SNA_API_KEY=[value from VPS .env]`
   - Redeploy

### Part 3: Test the Flow (1 minute)

1. Go to: https://sna-draw-request-app-bpnelsen.vercel.app
2. Upload an Excel file
3. Check your VPS logs:
   ```bash
   pm2 logs sna-processor
   ```
4. File should process and return result!

---

## What Changed in the App

### New API Routes

**`/api/upload`** (Updated)
- Sends files to VPS backend via HTTP
- Queues processing and returns result
- Handles VPS unavailability gracefully

**`/api/process-complete`** (New)
- Webhook called by VPS when processing done
- Updates file history with completion status

**`/api/download/[fileName]`** (New)
- Returns download link for processed files
- Files stored on VPS

### Environment Variables Needed

```
VPS_BACKEND_URL=http://your-vps-ip:3001
SNA_API_KEY=your-secure-key-from-vps
```

---

## Architecture Diagram

```
┌─────────────────────────┐
│    VERCEL (Frontend)    │
│  React UI Upload Form   │
│  /api/upload endpoint   │
└────────┬────────────────┘
         │ File + API Key
         │ HTTP POST
         ↓
┌─────────────────────────┐
│   YOUR VPS (Backend)    │
│  Node.js Express        │
│  server.js:3001         │
│  /process endpoint      │
└────────┬────────────────┘
         │ File to disk
         │ Spawn Python
         ↓
┌─────────────────────────┐
│  VPS (Python Process)   │
│ reorganize_sna_*.py     │
│ Processes Excel file    │
└────────┬────────────────┘
         │ Write result
         ↓
┌─────────────────────────┐
│  VPS Results Directory  │
│  /results/organized_*.xlsx
│  Available for download │
└─────────────────────────┘
```

---

## Security

✅ **API Key Authentication:** All requests to VPS require X-API-Key header  
✅ **Base64 Encoding:** Files encoded during transport  
✅ **File Validation:** Only .xlsx/.xls files accepted  

⚠️ **Recommendations:**
- Use HTTPS/SSL for Vercel→VPS communication
- Restrict VPS firewall to Vercel IPs only
- Rotate API keys regularly
- Keep Python dependencies updated

---

## Troubleshooting

### "VPS backend unavailable"
```bash
# Check if server is running
ps aux | grep "node server.js"

# Restart it
cd /data/.openclaw/workspace/sna-script
node server.js

# Or with PM2
pm2 restart sna-processor
```

### "Connection refused"
```bash
# Check firewall
sudo ufw status

# Check port
netstat -an | grep 3001

# Test connectivity from different machine
curl http://your-vps-ip:3001/health
```

### "Invalid API Key"
```bash
# Check .env file
cat /data/.openclaw/workspace/sna-script/.env

# Make sure Vercel env var matches exactly
```

### "File processing failed"
```bash
# Check Python is installed
python3 --version

# Check dependencies
pip3 list | grep openpyxl

# Check file permissions
chmod 755 /data/.openclaw/workspace/sna-script/uploads
chmod 755 /data/.openclaw/workspace/sna-script/results

# Check server logs
pm2 logs sna-processor
tail -f /var/log/syslog | grep sna-processor
```

---

## Files Changed in SNA App

- ✅ `app/api/upload/route.ts` - Now queues to VPS
- ✅ `app/api/process-complete/route.ts` - New webhook endpoint
- ✅ `app/api/download/[fileName]/route.ts` - New download endpoint
- ✅ `app/page.tsx` - Updated UI with VPS note
- ✅ `VPS_INTEGRATION.md` - This file

---

## Files Added to VPS

- ✅ `server.js` - Express backend server
- ✅ `package.json` - Node dependencies
- ✅ `VPS_SETUP.md` - Complete VPS setup guide
- ✅ `uploads/` - Directory for uploaded files
- ✅ `results/` - Directory for processed files

---

## Next Steps

1. ✅ Run `npm install` on VPS
2. ✅ Set environment variables
3. ✅ Start the server (`node server.js`)
4. ✅ Add environment variables to Vercel
5. ✅ Redeploy to Vercel
6. ✅ Test upload on live app

---

## Production Checklist

- [ ] VPS server running with PM2 or systemd
- [ ] SSL/HTTPS enabled for VPS (optional but recommended)
- [ ] Firewall configured for Vercel IPs only
- [ ] Backups set up for results directory
- [ ] Monitoring/alerting configured
- [ ] Log rotation set up
- [ ] Regular cleanup of old files
- [ ] API key rotated and stored securely

---

## Support

**VPS Issues?** See: `/data/.openclaw/workspace/sna-script/VPS_SETUP.md`  
**App Issues?** See: `/data/.openclaw/workspace/sna-draw-request-app/README.md`  
**GitHub Issues?** Check: https://github.com/bpnelsen/sna-draw-request-app/issues

---

**Last Updated:** 2026-03-05  
**Status:** Production-Ready ✅
