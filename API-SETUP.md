# SearchIQ API Setup Instructions

## ✅ What Was Built

### 1. **Serverless API Route** (`/api/claude.ts`)
- Proxies requests to Anthropic Claude API
- Keeps your API key secure on the server
- Handles errors gracefully
- Returns responses to the frontend

### 2. **Updated Frontend** (`/searchiq/index.html`)
- Removed exposed API key
- Now calls `/api/claude` instead of Anthropic directly
- Same functionality, more secure

### 3. **Dependencies**
- Added `@vercel/node` for TypeScript types

---

## 🔧 Vercel Environment Variable Setup

### Step 1: Go to Vercel Dashboard
1. Navigate to your project: **heyproxy-website**
2. Click **Settings** → **Environment Variables**

### Step 2: Add the API Key
- **Variable Name:** `ANTHROPIC_API_KEY`
- **Value:** `[YOUR ACTUAL ANTHROPIC API KEY]`
- **Environment:** Select all (Production, Preview, Development)

### Step 3: Redeploy
After adding the environment variable, trigger a redeploy:
- Go to **Deployments** tab
- Click the **...** menu on the latest deployment
- Click **Redeploy**

---

## 🧪 Testing

Once deployed with the environment variable:

1. Visit `searchiq.heyproxy.io`
2. Enter a domain (e.g., `heyproxy.io`)
3. Click **Analyze Site**
4. You should see the audit running with animated loading steps
5. Results should appear with scoring and recommendations

---

## 🔒 Security Benefits

✅ **API key never exposed** to the browser  
✅ **Server-side only** - key stored in Vercel environment  
✅ **No client-side vulnerabilities**  
✅ **Ready for rate limiting** (can add later)

---

## 📝 Future Enhancements (Optional)

- Add rate limiting per IP address
- Add usage tracking/analytics
- Add caching for repeated requests
- Add request validation/sanitization

---

## 🐛 Troubleshooting

**If you see "Server configuration error: API key not configured":**
- Make sure you added `ANTHROPIC_API_KEY` in Vercel
- Make sure you redeployed after adding the variable

**If you see "API error 401":**
- Check that your Anthropic API key is valid
- Verify the key has proper permissions

**If you see "API error 429":**
- You've hit rate limits on your Anthropic account
- Consider upgrading your plan or adding rate limiting

---

## ✨ You're All Set!

The code is deployed. Just add the environment variable in Vercel and you're good to go! 🚀

