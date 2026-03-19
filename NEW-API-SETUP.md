# 🔑 New API Setup Guide

This guide will help you set up the 3 new APIs we just integrated into SearchIQ.

---

## 📊 **API Overview**

| API | Cost | Purpose | API Key Required? |
|-----|------|---------|-------------------|
| **Mozilla Observatory** | FREE | Security validation | ❌ No |
| **CSP Evaluator** | FREE | CSP analysis | ❌ No |
| **DataForSEO** | ~$0.001/keyword | Real keyword data | ✅ Yes |

---

## ✅ **APIs That Work Immediately (No Setup)**

### 1. Mozilla Observatory API
- **Status:** ✅ Ready to use
- **Setup:** None required
- **What it does:** Validates your security findings with industry-standard benchmarks

### 2. CSP Evaluator API
- **Status:** ✅ Ready to use
- **Setup:** None required
- **What it does:** Analyzes Content Security Policy for weaknesses

---

## 🔧 **API That Needs Setup**

### 3. DataForSEO API (Keyword Research)

**This API provides REAL keyword data:**
- Search volume (e.g., "12,100 searches/month")
- Keyword difficulty (0-100 score)
- CPC data (what advertisers pay)
- Related keywords with volume

---

## 📝 **DataForSEO Setup Instructions**

### **Step 1: Create Account**

1. Go to: https://dataforseo.com/
2. Click "Sign Up" (top right)
3. Fill in your details:
   - Email
   - Password
   - Company name (can be "Heyproxy LLC")
4. Verify your email

### **Step 2: Get API Credentials**

1. Log in to DataForSEO dashboard
2. Go to: **API Access** (in left sidebar)
3. You'll see your credentials:
   - **Login:** (your email)
   - **Password:** (API password - NOT your account password)
4. Copy both values

### **Step 3: Add to Vercel Environment Variables**

1. Go to: https://vercel.com/heyproxy-llc/heyproxy-website
2. Click **Settings** tab
3. Click **Environment Variables** (left sidebar)
4. Add these two variables:

**Variable 1:**
- **Name:** `DATAFORSEO_LOGIN`
- **Value:** (your DataForSEO email)
- **Environment:** Production, Preview, Development (select all)

**Variable 2:**
- **Name:** `DATAFORSEO_PASSWORD`
- **Value:** (your DataForSEO API password)
- **Environment:** Production, Preview, Development (select all)

5. Click **Save**

### **Step 4: Redeploy**

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait ~30 seconds for deployment

### **Step 5: Add Credits (Optional)**

DataForSEO is pay-as-you-go:
- **Cost:** ~$0.001 per keyword analyzed
- **Example:** 1,000 keyword analyses = $1
- **Minimum deposit:** $10 (lasts a LONG time)

To add credits:
1. Go to DataForSEO dashboard
2. Click **Billing** (left sidebar)
3. Click **Add Funds**
4. Add $10-$50 (your choice)

---

## 🧪 **Testing the APIs**

### **Test Mozilla Observatory:**
1. Go to: https://searchiq.heyproxy.io
2. Enter any domain (e.g., `wildtigers.world`)
3. Run SEO audit first
4. Go to **Security Audit** tab
5. Click **Run Security Audit**
6. You should see "Mozilla Observatory Grade: A" (or similar)

### **Test CSP Evaluator:**
1. Same as above
2. If the site has a CSP header, you'll see "CSP Score: XX/100"

### **Test DataForSEO:**
1. Go to **Keyword Analyzer** tab
2. Enter a keyword (e.g., `technical SEO`)
3. Click **Analyze Keyword**
4. You should see:
   - "Search Volume: 12,100/month" (real data)
   - "Competition Index: 67/100" (real data)
   - Related keywords with volume

**If DataForSEO is NOT configured:**
- You'll still get AI analysis
- But no real search volume data
- You'll see a message: "Real keyword data not available"

---

## 💰 **Cost Estimate**

### **Monthly Cost Breakdown:**

| Usage Level | Keywords Analyzed | Cost |
|-------------|-------------------|------|
| **Light** | 100 keywords/month | $0.10 |
| **Medium** | 1,000 keywords/month | $1.00 |
| **Heavy** | 10,000 keywords/month | $10.00 |

**Example:**
- 100 users × 10 keywords each = 1,000 keywords = **$1/month**

---

## ❓ **Troubleshooting**

### **"DataForSEO API not configured" error:**
- Check that you added both `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` to Vercel
- Make sure you redeployed after adding the variables
- Check that the variable names are EXACTLY as shown (case-sensitive)

### **"Insufficient funds" error:**
- Add credits to your DataForSEO account (Billing → Add Funds)

### **Mozilla Observatory shows "Scan in progress":**
- This is normal - Observatory scans can take 30-60 seconds
- Refresh the page and try again

---

## 🎉 **You're Done!**

Once DataForSEO is configured, your SearchIQ tool will have:
- ✅ Triple-validated security audits (Your analysis + SSL Labs + Mozilla Observatory)
- ✅ Deep CSP analysis (Google's CSP Evaluator)
- ✅ Real keyword data (Search volume, difficulty, CPC)
- ✅ Professional-grade SEO insights

**Your tool is now best-in-class!** 🚀

