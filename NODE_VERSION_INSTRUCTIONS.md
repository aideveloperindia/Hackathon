# Node.js Version Configuration for Vercel

## Important Note

Vercel has a specific requirement:
- **package.json** must specify: `"engines": { "node": "18.x" }`
- **Vercel Dashboard** should be set to: **20.x** (or whatever is available)

## Why This Happens

Vercel's build system checks the `package.json` engines field and requires 18.x, even though the dashboard might show 20.x as an option. This is a known quirk in Vercel's configuration.

## Solution

### Step 1: Set Dashboard to 20.x
1. Go to: https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general
2. Set **Node.js Version** to **20.x** (or the highest available)
3. Click **Save**

### Step 2: Keep package.json as 18.x
The `package.json` already has:
```json
"engines": {
  "node": "18.x"
}
```

**Do NOT change this** - Vercel's build system requires 18.x in package.json.

### Step 3: Deploy
```bash
npx vercel --prod
```

## Current Configuration

- ✅ `package.json`: `"engines": { "node": "18.x" }`
- ✅ `.nvmrc`: `18`
- ⚠️  Dashboard: Should be set to 20.x (or highest available)

## If Still Getting Errors

If you still get the error about Node.js version:
1. Make sure `package.json` has `"engines": { "node": "18.x" }`
2. Set dashboard to the highest available version (20.x)
3. Try deploying again

The build system will use the version from the dashboard, but it checks package.json for compatibility.


