# Hospital Bed Occupancy System - Architecture Extension

## Overview
Extended the existing hospital management system with role-based authentication and a patient-facing public API layer.

---

## ✅ Phase 1: Backend Authentication (COMPLETED)

### Database Schema
```
users table:
- id (Primary Key)
- name
- email (Unique, Indexed)
- hashed_password
- role (HOSPITAL_ADMIN | PATIENT)
- hospital_id (Foreign Key, nullable)
```

### Authentication System
- **JWT Tokens**: 24-hour expiration
- **Password Hashing**: bcrypt
- **Libraries**: python-jose, passlib

### Endpoints

#### POST /api/auth/register
Register new user with role assignment
- **PATIENT**: No hospital required
- **HOSPITAL_ADMIN**: Must link to valid hospital_id

#### POST /api/auth/login
Authenticate and receive JWT token

#### GET /api/auth/me
Get current user information (protected)

### Authorization Middleware
```python
get_current_user()           # Extract user from JWT
require_hospital_admin()     # Require admin role
require_patient()            # Require patient role
```

---

## ✅ Phase 2: Public Patient APIs (COMPLETED)

### API Layer Separation

**Internal APIs** (`/api/...`)
- Require HOSPITAL_ADMIN role
- Access to raw EHR data
- Hospital management functions

**Public APIs** (`/api/public/...`)
- Accessible to PATIENT role
- Only aggregated/anonymized data
- No raw EHR exposure

### Public Endpoints

#### GET /api/public/hospitals
Get list of all hospitals with basic info
- Filter by city
- No authentication required

#### GET /api/public/availability/{hospital_id}
Get current bed availability
- Real-time occupancy status
- Color-coded risk levels (green/yellow/red)
- No sensitive patient data

#### GET /api/public/forecast/{hospital_id}
Get 7-day occupancy forecast
- ML-based predictions
- **Best day to visit recommendation**
- Risk level for each day

#### GET /api/public/compare
Compare multiple hospitals
- Rank by availability
- Recommendation scores
- Filter by city

#### GET /api/public/recommendation/{city}
Get best hospital recommendation for a city
- Analyzes all hospitals
- Returns ranked list
- Provides reasoning

#### GET /api/public/alerts/{hospital_id}
Get high-occupancy alerts
- Warns about crowded days
- Suggests alternate hospitals
- Severity levels

---

## Key Features Implemented

### 1. Role-Based Access Control ✓
- JWT tokens with embedded role
- Middleware protection
- Route-level authorization

### 2. Hospital-Patient Synchronization ✓
- Single prediction engine
- Hospital uploads EHR → ML generates predictions
- Patients consume prediction summaries
- Zero data duplication

### 3. Best Time to Visit ✓
- Analyzes 7-day forecast
- Identifies lowest occupancy day
- Returns in forecast response

### 4. Hospital Comparison ✓
- Multi-hospital ranking
- Recommendation scores (0-100)
- Current + predicted availability

### 5. Smart Alerts ✓
- High occupancy warnings
- Alternate hospital suggestions
- Risk severity levels

---

## Security & Privacy

### Data Protection
✅ Patients NEVER see raw EHR data
✅ Only aggregated predictions exposed
✅ No personal patient information leaked
✅ Hospital-specific admins can't access other hospitals

### Authentication Flow
```
User Register/Login
  ↓
JWT Token Generated (contains role + hospital_id)
  ↓
Token sent with each request
  ↓
Middleware validates & extracts user
  ↓
Route checks role authorization
  ↓
Access granted/denied
```

---

## Next Steps: Frontend Integration

### Phase 3: Update Existing Auth System
- Add role to JWT storage
- Create role-based route guards
- Update login/register to handle roles

### Phase 4: Build Patient Dashboard
- New `/patient` route
- Hospital availability viewer
- Best time to visit display
- Hospital comparison UI
- Alerts panel

---

## API Testing

You can test the new endpoints at:
- **Swagger Docs**: http://localhost:8000/docs
- **Auth endpoints**: `/api/auth/*`
- **Public endpoints**: `/api/public/*`

### Quick Test Flow
1. POST `/api/auth/register` with role="PATIENT"
2. POST `/api/auth/login` to get token
3. GET `/api/public/forecast/1` with Bearer token
4. Check "best_day_to_visit" field

---

## Database Migration

Run to create new users table:
```bash
# Tables created automatically on server start
python -m app.main
```

---

## Configuration

Add to `.env` file:
```env
SECRET_KEY=your-secure-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**IMPORTANT**: Change SECRET_KEY before production deployment!

---

## Architecture Decisions

### Why Single Prediction Engine?
- Eliminates data duplication
- Ensures consistency between dashboards
- Reduces computational overhead
- Simplifies maintenance

### Why JWT Tokens?
- Stateless authentication
- No server-side session storage
- Easy to scale horizontally
- Role embedded in token

### Why Separate Public API Layer?
- Clear security boundary
- Easy to audit what patients can access
- Can add rate limiting per role
- Future-proof for mobile apps

---

## Success Metrics

✅ Hospital admins manage capacity internally
✅ Patients see predictions without EHR access
✅ Both use same ML engine
✅ Clear role separation
✅ Ready for patient dashboard UI

---

**Status**: Backend complete. Ready for frontend implementation.
**Next**: Update frontend AuthContext and build patient dashboard pages.
