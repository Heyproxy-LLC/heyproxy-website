# 🔑 API Keys Setup Guide for SearchIQ

This guide will walk you through getting **FREE API keys** for the SearchIQ tool.

---

## ✅ Already Have (No Action Needed)

### 1. Anthropic API Key
- **Status:** ✅ Already configured in Vercel
- **Variable:** `ANTHROPIC_API_KEY`
- **Used for:** Claude AI analysis (SEO audit, Security audit, Meta generator, Keyword analyzer)

---

## 🆓 FREE API Keys You Need to Get

### 2. Google PageSpeed Insights API Key

**What it does:** Fetches real Core Web Vitals, performance scores, mobile/desktop analysis

**Cost:** 100% FREE (25,000 requests/day limit - way more than you'll ever need)

**How to get it:**

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing one)
   - Click "Select a project" at the top
   - Click "NEW PROJECT"
   - Name it: "SearchIQ"
   - Click "CREATE"
3. Enable the PageSpeed Insights API:
   - Go to: https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com
   - Click "ENABLE"
4. Create an API key:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "CREATE CREDENTIALS" → "API key"
   - Copy the API key (looks like: `AIzaSyD...`)
5. (Optional but recommended) Restrict the API key:
   - Click on the API key you just created
   - Under "API restrictions" → Select "Restrict key"
   - Check only "PageSpeed Insights API"
   - Click "SAVE"

**Add to Vercel:**
- Go to: https://vercel.com/heyproxy-llc/heyproxy-website/settings/environment-variables
- Click "Add New"
- Name: `GOOGLE_PAGESPEED_API_KEY`
- Value: Paste your API key
- Click "Save"

---

### 3. SSL Labs API

**What it does:** Fetches real SSL/TLS grade (A+, A, B, F, etc.), certificate info, vulnerabilities

**Cost:** 100% FREE (No API key needed!)

**How to get it:**

**NO ACTION NEEDED!** SSL Labs API is completely free and doesn't require an API key. It's already integrated and will work immediately.

**Note:** SSL Labs scans can take 30-60 seconds on first run (they cache results for 24 hours after that).

---

## 🚀 After Adding API Keys

### Redeploy Your Site

After adding the `GOOGLE_PAGESPEED_API_KEY` to Vercel:

1. Go to: https://vercel.com/heyproxy-llc/heyproxy-website
2. Click "Deployments"
3. Click the three dots (...) on the latest deployment
4. Click "Redeploy"
5. Wait ~30 seconds for deployment to complete

**OR** just push a new commit and Vercel will auto-deploy.

---

## 🧪 Testing Your Setup

### Test PageSpeed API:

1. Go to: https://searchiq.heyproxy.io
2. Enter a domain (e.g., `google.com`)
3. Click "Analyze Site"
4. Check the browser console (F12) for any errors
5. The audit should now include **real Core Web Vitals** data

### Test SSL Labs API:

1. Go to the "Security Audit" tab
2. Click "Run Security Audit"
3. Wait 30-60 seconds (first scan takes longer)
4. The report should include **real SSL grade** (A+, A, B, etc.)

---

## 📊 What Data is Now REAL vs AI Inference

### ✅ 100% REAL DATA (No Guessing):

**SEO Audit:**
- ✅ Core Web Vitals (FCP, LCP, CLS, TBT)
- ✅ Performance scores (Mobile & Desktop)
- ✅ Accessibility score
- ✅ Best Practices score
- ✅ SEO score (from Google)
- ✅ Tech stack detection
- ✅ Security headers
- ✅ Sitemap/robots.txt detection
- ✅ Meta tags (title, description)

**Security Audit:**
- ✅ SSL/TLS grade (A+ to F)
- ✅ Certificate info & expiry
- ✅ TLS version support
- ✅ Known vulnerabilities (Heartbleed, POODLE, etc.)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Exposed files (.env, .git, wp-config)
- ✅ HTTP→HTTPS redirect check

**Meta Generator:**
- ✅ AI-generated copy (legitimate use of Claude)

### ⚠️ AI INFERENCE (Claude Analysis):

**Keyword Analyzer:**
- ⚠️ Search volume estimates (would need paid API like DataForSEO)
- ⚠️ Keyword difficulty scores (would need paid API)
- ✅ Intent analysis (Claude is good at this)
- ✅ Content strategy (Claude is good at this)

**Note:** To make Keyword Analyzer 100% real, you'd need a paid API like:
- DataForSEO (~$0.01/request)
- SEMrush API (paid)
- Ahrefs API (paid)

For now, Keyword Analyzer provides strategic analysis but volume/difficulty are estimates.

---

## 🎯 Summary

**What you need to do:**
1. ✅ Get Google PageSpeed API key (FREE, 5 minutes)
2. ✅ Add it to Vercel environment variables
3. ✅ Redeploy

**What's already done:**
- ✅ Anthropic API key (already configured)
- ✅ SSL Labs API (no key needed, already integrated)
- ✅ All code is deployed and ready

**Result:**
- 🔥 100% real SEO data (Core Web Vitals, performance scores)
- 🔥 100% real Security data (SSL grade, vulnerabilities)
- 🔥 No more guessing!

---

## 🆘 Need Help?

If you run into issues:

1. Check Vercel function logs:
   - Go to: https://vercel.com/heyproxy-llc/heyproxy-website/deployments
   - Click latest deployment → "Functions" tab
   - Click on `/api/pagespeed` or `/api/ssl-check`
   - Check the logs for errors

2. Check browser console (F12) for frontend errors

3. Make sure environment variables are set correctly in Vercel

---

**You're almost there! Just need that Google PageSpeed API key and you're 100% REAL! 🚀**

