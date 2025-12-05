# Admin Dashboard Troubleshooting Guide

## Issue: Admin Dashboard Not Working

### Quick Fix Steps:

1. **Check if you're logged in:**
   - Go to http://localhost:3001
   - If you see "Logged in as: admin@jits.ac.in", you're logged in
   - If not, log in first at http://localhost:3001/admin/login

2. **Login Credentials:**
   - Email: `admin@jits.ac.in`
   - Password: `admin123`

3. **After Login:**
   - You should be automatically redirected to `/admin/dashboard`
   - If not, click "Admin Dashboard" button on home page

4. **If Dashboard Shows Error:**
   - Check browser console (F12 → Console tab)
   - Look for any red error messages
   - Check Network tab to see if API calls are failing

5. **Common Issues:**

   **Issue: "No token provided"**
   - Solution: Log out and log back in
   - The token might have expired

   **Issue: Redirects to home page**
   - Solution: Check browser console for authentication errors
   - Make sure you're using admin credentials, not student

   **Issue: "Failed to load dashboard"**
   - Solution: Check if backend is running (http://localhost:5001/api/health)
   - Restart backend if needed

6. **Manual Test:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('token')`
   - If it returns `null`, you need to log in again
   - If it returns a token, the issue might be with the API

7. **Backend Check:**
   - Open terminal and run: `curl http://localhost:5001/api/health`
   - Should return: `{"status":"ok","message":"JITS Coding Platform API is running"}`
   - If not, backend is not running

## What I Fixed:

1. ✅ Added better error handling in AdminDashboard component
2. ✅ Added loading states with messages
3. ✅ Added error messages if dashboard fails to load
4. ✅ Improved login redirect logic
5. ✅ Added debug logging to PrivateRoute
6. ✅ Fixed User interface to support MongoDB string IDs

## Next Steps if Still Not Working:

1. Clear browser cache and localStorage:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Refresh page and log in again

2. Check backend logs:
   - Look at the terminal where backend is running
   - Check for any error messages

3. Verify database connection:
   - Make sure MongoDB Atlas is accessible
   - Check `.env` file has correct DATABASE_URL

4. Restart everything:
   ```bash
   # Kill all processes
   pkill -f "tsx watch"
   pkill -f "vite"
   
   # Restart backend
   cd backend && npm run dev
   
   # Restart frontend (in new terminal)
   cd frontend && npm run dev
   ```

