# Complete Testing Guide - Role-Based Hospital System

## System Status

✅ **Backend**: Running on http://localhost:8000  
✅ **Frontend**: Running on http://localhost:3001  
✅ **Database**: PostgreSQL with users table created  
✅ **Authentication**: JWT with role-based access (HOSPITAL_ADMIN / PATIENT)

---

## Quick Start Test Flow

### 1. Register as a Patient

1. Navigate to http://localhost:3001/register
2. Select role: **Patient** (left card)
3. Fill in:
   - Name: "John Patient"
   - Email: "john@patient.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click **Create Account**
5. **Expected**: Auto-redirect to `/patient` dashboard

### 2. Explore Patient Dashboard

#### Find Hospitals Page
- Search hospitals by name or city
- Filter by city dropdown
- View real-time availability status (Green/Yellow/Red)
- Click "View 7-day forecast" to see predictions

#### Best Time to Visit Page
- Select a hospital from dropdown
- See 7-day forecast with color-coded risk levels
- **Best Day** highlighted with star icon
- Shows predicted occupancy and available beds

#### Compare Hospitals Page
- Select 2-5 hospitals
- Click "Compare X Hospitals"
- See ranked list with recommendation scores (0-100)
- #1 hospital gets "🏆 Best Choice" badge

#### Alerts Page
- Select a hospital
- See high-occupancy warnings
- Get alternate hospital suggestions with better availability

### 3. Test Hospital Admin Flow

1. **Logout**: Click logout in patient dashboard
2. Navigate to http://localhost:3001/register
3. Select role: **Hospital Admin** (right card)
4. Fill in:
   - Name: "Admin User"
   - Email: "admin@hospital.com"
   - Hospital: Select "Metro General Hospital - New York" (or any hospital)
   - Password: "password123"
5. Click **Create Account**
6. **Expected**: Auto-redirect to `/dashboard` (hospital admin dashboard)

### 4. Explore Hospital Admin Dashboard

- View dashboard overview with metrics
- Check EHR data
- See Prophet ML predictions
- Generate reports (PDF, Excel, CSV, JSON)
- View alerts panel
- Manage hospitals

---

## API Endpoints Testing

### Public API (No Auth Required)

```bash
# List all hospitals
curl http://localhost:8000/api/public/hospitals

# Get hospital availability
curl http://localhost:8000/api/public/availability/1

# Get 7-day forecast with best day
curl http://localhost:8000/api/public/forecast/1

# Compare hospitals
curl "http://localhost:8000/api/public/compare?hospital_ids=1,2,3"

# Get city recommendation
curl http://localhost:8000/api/public/recommendation/NewYork

# Get alerts
curl http://localhost:8000/api/public/alerts/1
```

### Authentication Endpoints

```bash
# Register Patient
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@patient.com",
    "password": "password123",
    "role": "PATIENT"
  }'

# Register Hospital Admin
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@admin.com",
    "password": "password123",
    "role": "HOSPITAL_ADMIN",
    "hospital_id": 1
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@patient.com",
    "password": "password123"
  }'

# Get Current User (requires token)
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Protected Admin Endpoints (Require Hospital Admin Role)

```bash
# Get dashboard (requires admin token)
curl http://localhost:8000/api/dashboard/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create EHR record (requires admin token)
curl -X POST http://localhost:8000/api/ehr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "hospital_id": 1,
    "date": "2025-06-01",
    "admissions": 45,
    "discharges": 40,
    "occupied_beds": 180,
    "icu_occupied": 15
  }'
```

---

## Feature Verification Checklist

### ✅ Authentication & Authorization

- [x] Patient can register without hospital_id
- [x] Admin must select hospital during registration
- [x] JWT token includes user role
- [x] Token expires after 24 hours
- [x] Failed login shows error message
- [x] Logout clears token and redirects

### ✅ Role-Based Access Control

- [x] Patient cannot access `/dashboard/*` routes
- [x] Admin cannot access `/patient/*` routes
- [x] Wrong role redirects to appropriate dashboard
- [x] API returns 401 for missing/invalid token
- [x] API returns 403 for insufficient permissions

### ✅ Patient Features

- [x] View all hospitals with real-time availability
- [x] Search and filter hospitals
- [x] See 7-day forecast with best day recommendation
- [x] Compare hospitals side-by-side
- [x] View high-occupancy alerts
- [x] Get alternate hospital suggestions

### ✅ Hospital Admin Features

- [x] View dashboard with Prophet ML predictions
- [x] Access raw EHR data
- [x] Generate multi-format reports
- [x] View alerts panel
- [x] Manage hospitals
- [x] Upload EHR records

### ✅ Backend Security

- [x] `/api/ehr/*` requires HOSPITAL_ADMIN role
- [x] `/api/predict/*` requires HOSPITAL_ADMIN role
- [x] `/api/dashboard/*` requires HOSPITAL_ADMIN role
- [x] `/api/hospitals` POST requires HOSPITAL_ADMIN role
- [x] `/api/public/*` accessible without authentication
- [x] Password hashing with bcrypt
- [x] Email validation with email-validator

### ✅ Frontend Security

- [x] Protected routes check authentication
- [x] Role-based route guards
- [x] JWT token in Authorization header
- [x] Token expiration handling (401 → redirect to login)
- [x] Role mismatch handling (redirect to correct dashboard)

---

## Known Limitations

1. **SECRET_KEY**: Currently hardcoded in auth_service.py
   - **TODO**: Move to environment variable (`.env` file)
   - **Security Risk**: Change before production deployment

2. **Token Storage**: JWT stored in localStorage
   - **Note**: Consider HttpOnly cookies for production

3. **Email Verification**: Not implemented
   - Users can register without email confirmation

4. **Password Reset**: Not implemented

5. **Multi-Hospital Admin**: One admin = one hospital
   - Cannot manage multiple hospitals with single account

---

## Debugging Tips

### Backend Not Starting

```powershell
# Check if dependencies are installed
cd d:\CIH_1\backend
pip list | Select-String "passlib|jose|bcrypt|email-validator"

# Reinstall if missing
pip install python-jose[cryptography] passlib[bcrypt] email-validator
```

### Frontend Auth Errors

1. Open Browser DevTools → Network tab
2. Check API requests for:
   - Missing `Authorization` header
   - 401 Unauthorized responses
   - 403 Forbidden responses
3. Check Console for errors

### Database Issues

```powershell
# Check if users table exists
psql -U postgres -d hospital_occupancy
\dt
# Should see: users table

# View users
SELECT id, name, email, role FROM users;
```

---

## Testing Scenarios

### Scenario 1: Patient Finds Best Time to Visit

1. Register/Login as patient
2. Go to "Find Hospitals" tab
3. Search for "Metro General Hospital"
4. Click "View 7-day forecast"
5. See best day highlighted with star
6. Check risk level and available beds

**Expected**: Patient sees which day has lowest occupancy

### Scenario 2: Compare Hospitals

1. Patient dashboard → "Compare Hospitals"
2. Select 3 hospitals from same city
3. Click "Compare 3 Hospitals"
4. See ranked list with scores
5. Top hospital shows "🏆 Best Choice"

**Expected**: Clear recommendation based on availability

### Scenario 3: High-Occupancy Alert

1. Patient dashboard → "Alerts"
2. Select a busy hospital
3. See warnings for high-occupancy days
4. Get alternate hospital suggestions

**Expected**: Patient sees warnings and alternatives

### Scenario 4: Admin Views Dashboard

1. Register/Login as hospital admin
2. View dashboard overview
3. Check Prophet ML predictions
4. Generate PDF report
5. View alerts panel

**Expected**: Admin sees internal metrics and predictions

### Scenario 5: Role-Based Security

1. Login as patient
2. Try to access http://localhost:3001/dashboard
3. **Expected**: Redirect to `/patient`

4. Login as admin
5. Try to access http://localhost:3001/patient
6. **Expected**: Redirect to `/dashboard`

---

## Success Criteria

✅ **All Features Working**
- Patient can register, login, and use all 4 pages
- Admin can register, login, and access dashboard
- Role-based redirects work correctly
- API authentication protects sensitive endpoints
- Prophet ML predictions accessible to both roles (via different APIs)

✅ **Security Implemented**
- Passwords hashed with bcrypt
- JWT tokens with 24hr expiration
- Role-based access control
- Protected API endpoints
- Frontend route guards

✅ **Architecture Goals Met**
- Single ML prediction engine shared
- Aggregated data for patients
- Raw data for admins
- Clear API separation (`/api/public/*` vs `/api/*`)
- Best time to visit feature working

---

## Next Steps (Production Readiness)

1. **Environment Variables**
   - Move SECRET_KEY to `.env`
   - Configure database URL
   - Set token expiration time

2. **Email Verification**
   - Send confirmation emails
   - Verify email before activation

3. **Password Reset**
   - Forgot password flow
   - Email reset link

4. **Rate Limiting**
   - Prevent API abuse
   - Throttle registration attempts

5. **HTTPS**
   - SSL/TLS certificates
   - Secure cookie storage

6. **Logging & Monitoring**
   - Log authentication attempts
   - Monitor API usage
   - Track errors

7. **Testing**
   - Unit tests for auth service
   - Integration tests for API
   - E2E tests for user flows

---

## Contact & Support

- **Backend API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3001
- **Database**: PostgreSQL on localhost:5432

**Status**: ✅ System fully functional and ready for testing
