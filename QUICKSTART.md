# Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Database Setup (2 minutes)

```powershell
# Start PostgreSQL and create database
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE hospital_db;
\q
```

### Step 2: Backend Setup (2 minutes)

```powershell
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db > .env

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be running at:** `http://localhost:8000`

### Step 3: Generate Sample Data (1 minute)

```powershell
# In a NEW terminal window
cd backend
python generate_data.py
```

This creates:
- 3 sample hospitals
- 60 days of realistic EHR data
- Ready for predictions

### Step 4: Frontend Setup (2 minutes)

```powershell
# In a NEW terminal window
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Dashboard will open at:** `http://localhost:3000`

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Database created and accessible
- [ ] Sample data generated (3 hospitals)
- [ ] Frontend running on port 3000
- [ ] Dashboard displays hospital data
- [ ] Predictions visible in chart
- [ ] Alerts showing (if any)

---

## 🔍 Quick Tests

### Test 1: API Health
```powershell
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Test 2: View API Docs
Open browser: `http://localhost:8000/docs`

### Test 3: Get Hospitals
```powershell
curl http://localhost:8000/api/hospitals
```

### Test 4: Get Predictions
```powershell
curl http://localhost:8000/api/predict/1
```

### Test 5: Dashboard Data
```powershell
curl http://localhost:8000/api/dashboard/1
```

---

## 🐛 Troubleshooting

### Issue: Database connection error
**Solution:**
1. Check PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
2. Verify database exists: `psql -U postgres -l`
3. Check .env file has correct DATABASE_URL

### Issue: Prophet installation fails
**Solution:**
```powershell
# Install prophet dependencies first
pip install pystan
pip install prophet
```

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify backend is running on port 8000
2. Check browser console for CORS errors
3. Ensure vite.config.js proxy is configured

### Issue: No data showing in dashboard
**Solution:**
```powershell
# Run data generator
cd backend
python generate_data.py
```

### Issue: Port already in use
**Solution:**
```powershell
# For backend (port 8000):
uvicorn app.main:app --reload --port 8001

# For frontend (port 3000):
# Edit vite.config.js, change port to 3001
```

---

## 📊 What to Demo

### 1. Dashboard Overview (30 sec)
- Show real-time metrics
- Point out utilization percentage
- Highlight color-coded status

### 2. Prediction Chart (1 min)
- Historical data (blue line)
- Future predictions (green dashed)
- Confidence interval (shaded area)
- Explain 7-day forecast

### 3. Alerts Panel (30 sec)
- Show capacity warnings
- Explain risk categories
- Demonstrate proactive planning

### 4. Hospital Selector (15 sec)
- Switch between hospitals
- Show multi-tenant capability

### 5. API Documentation (30 sec)
- Open /docs
- Show interactive API explorer
- Demonstrate RESTful design

---

## 🎯 Key Talking Points

### Technical Excellence
- "Production-ready FastAPI backend with proper error handling"
- "Prophet ML model for accurate time-series forecasting"
- "Clean separation of concerns - models, schemas, routers, services"
- "RESTful API design following best practices"

### Business Value
- "Predicts bed shortages 7 days in advance"
- "Reduces patient wait times through proactive planning"
- "Color-coded alerts for quick decision making"
- "Supports multiple hospitals from one dashboard"

### ML Approach
- "Using Prophet because it's designed for daily time-series"
- "Automatically handles weekly seasonality"
- "Provides confidence intervals for uncertainty quantification"
- "Much faster and more explainable than deep learning"

### Scalability
- "Environment-based configuration for easy deployment"
- "PostgreSQL for reliable data storage"
- "CORS-enabled for secure frontend communication"
- "Ready to deploy on Render, AWS, or any cloud platform"

---

## 📈 Expected Results

After setup, you should see:

**Dashboard Metrics:**
- Total Beds: 250 (or similar)
- Current Occupancy: ~70-85%
- ICU Usage: 60-80%
- Utilization: Green/Yellow/Red status

**Prediction Chart:**
- 30 days historical data
- 7 days future predictions
- Confidence bounds visible

**Alerts:**
- 0-3 alerts depending on predictions
- Color-coded by severity

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Update CORS origins in main.py
- [ ] Set DATABASE_URL to production database
- [ ] Change API_RELOAD to False
- [ ] Add authentication (if required)
- [ ] Set up monitoring/logging
- [ ] Configure SSL/HTTPS
- [ ] Test with production data
- [ ] Set up automated backups

---

## 📞 Need Help?

1. **Check logs:**
   - Backend: Terminal where uvicorn is running
   - Frontend: Browser console (F12)

2. **Review documentation:**
   - README.md - Full documentation
   - /docs - API documentation

3. **Common solutions:**
   - Restart servers
   - Clear browser cache
   - Regenerate sample data
   - Check database connection

---

**Happy Hacking! 🎉**
