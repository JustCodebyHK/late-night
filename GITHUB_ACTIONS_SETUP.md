# GitHub Actions Setup for Min/Max Tracking

This enables 24/7 min/max temperature tracking **without Firebase Blaze plan**.

---

## 🔑 Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/late-night-82be8)
2. **Project Settings** (gear icon) → **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file securely (treat like a password!)
5. **Copy the entire JSON content** (including `{` and `}`)

---

## 🔐 Step 2: Add GitHub Secret

1. Go to your GitHub repo: `https://github.com/<your-username>/<your-repo>`
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
4. **Value:** Paste the **entire JSON** from step 1
5. Click **Add secret**

---

## 🚀 Step 3: Test Locally (Optional)

```bash
# Set env var temporarily
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"late-night-82be8",...}'

# Run script
cd esp32-dashboard
node scripts/update-minmax.js
```

Expected output:
```
✅ Firebase Admin initialized
🌡️ Current temperature: 24.5°C
📈 New maximum: 24.5°C
✅ Min/Max updated in Firebase: { min: 24.5, max: 24.5, minTime: 1700000000000, maxTime: 1700000000000 }
✅ Script completed successfully
```

---

## ⏰ Step 4: Verify Automation

The workflow runs **every 5 minutes** automatically via cron (`*/5 * * * *`).

### Check Runs:
1. Go to **Actions** tab in your GitHub repo
2. Click **"Update Min/Max Temperature"** workflow
3. Should see green checkmarks every 5 minutes

### Manual Trigger:
- Actions tab → "Update Min/Max Temperature" → **Run workflow**

---

## 📊 What It Does

| Action | Frequency | Location |
|--------|-----------|----------|
| Read `/sensor/temperature` | Every 5 min | GitHub Actions (free) |
| Compare with `/sensor/minmax` | Every 5 min | GitHub Actions |
| Update min/max if changed | When needed | Firebase Realtime DB |
| Dashboard reads min/max | Real-time | Your browser |

---

## 🔍 Troubleshooting

| Issue | Fix |
|-------|-----|
| `FIREBASE_SERVICE_ACCOUNT_KEY not set` | Check secret name exactly matches |
| `Permission denied` | Service account needs Database Admin role |
| `Invalid JSON` | Copy entire JSON including braces |
| Workflow not running | Check repo has Actions enabled (Settings → Actions → General) |

---

## 💰 Cost

| Platform | Cost |
|----------|------|
| GitHub Actions | **Free** (2,000 min/month for private repos) |
| Firebase Realtime DB | **Free** (Spark plan: 1GB storage, 10GB/month download) |
| **Total** | **$0/month** |

---

## 🔄 Your ESP8266 Code: No Changes Needed!

```cpp
// Still works exactly as-is:
Firebase.setFloat(fbdo, "/sensor/temperature", temp);
Firebase.setFloat(fbdo, "/sensor/humidity", hum);
```

The GitHub Action reads from `/sensor/temperature` and writes min/max to `/sensor/minmax` - your dashboard already reads from there!

---

## 📱 Dashboard Already Compatible

Your dashboard at `http://localhost:5173` reads min/max from `/sensor/minmax` in real-time. After GitHub Actions runs overnight, you'll see:

```
Temperature Extremes
┌─────────────┐ ┌─────────────┐
│ ▼ Minimum   │ │ ▲ Maximum   │
│   18.2°C    │ │   31.5°C    │
│   04:32 AM  │ │   02:17 PM  │
└─────────────┘ └─────────────┘
```

Even if dashboard was closed all night!