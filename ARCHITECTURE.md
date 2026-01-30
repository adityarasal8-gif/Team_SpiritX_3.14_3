# System Architecture & Technical Documentation

## 📐 Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            React Dashboard (Port 3000)                   │  │
│  │  • Hospital Selector  • Metric Cards  • Charts          │  │
│  │  • Alerts Panel       • Real-time Updates               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         FastAPI Backend (Port 8000)                      │  │
│  │                                                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │  │
│  │  │ Hospitals  │  │    EHR     │  │  Predictions   │  │  │
│  │  │  Router    │  │   Router   │  │     Router     │  │  │
│  │  └────────────┘  └────────────┘  └─────────────────┘  │  │
│  │         │               │                  │           │  │
│  │         └───────────────┴──────────────────┘           │  │
│  │                         │                              │  │
│  │                    ┌────▼─────┐                        │  │
│  │                    │ Schemas  │ (Pydantic)             │  │
│  │                    └────┬─────┘                        │  │
│  │                         │                              │  │
│  │                    ┌────▼─────┐                        │  │
│  │                    │  Models  │ (SQLAlchemy)           │  │
│  │                    └──────────┘                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌─────────────────────────────┐  ┌──────────────────────────┐
│      DATA LAYER             │  │      ML/AI LAYER         │
│                             │  │                          │
│  ┌────────────────────────┐ │  │  ┌────────────────────┐ │
│  │   PostgreSQL DB        │ │  │  │  Prophet Service   │ │
│  │                        │ │  │  │                    │ │
│  │  • hospitals table     │ │  │  │  • Train model     │ │
│  │  • ehr_records table   │ │  │  │  • Generate preds  │ │
│  │  • Relationships       │ │  │  │  • Risk analysis   │ │
│  │  • Constraints         │ │  │  │  • Alert generation│ │
│  └────────────────────────┘ │  │  └────────────────────┘ │
└─────────────────────────────┘  └──────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Hospital Creation Flow

```
Frontend                Backend                    Database
   │                       │                          │
   │──(1) POST /hospitals─→│                          │
   │     {hospital_data}   │                          │
   │                       │──(2) Validate Schema────→│
   │                       │     (Pydantic)           │
   │                       │                          │
   │                       │──(3) Create Model────────→│
   │                       │     (SQLAlchemy)         │
   │                       │                          │
   │                       │←─(4) Return ID───────────│
   │                       │                          │
   │←─(5) Return Hospital──│                          │
   │     {id, name, ...}   │                          │
```

### 2. EHR Data Submission Flow

```
Frontend                Backend                    Database
   │                       │                          │
   │──(1) POST /ehr───────→│                          │
   │     {ehr_data}        │                          │
   │                       │──(2) Validate───────────→│
   │                       │    • Hospital exists     │
   │                       │    • Beds <= capacity    │
   │                       │    • No duplicates       │
   │                       │                          │
   │                       │──(3) Insert Record──────→│
   │                       │                          │
   │                       │←─(4) Confirm─────────────│
   │                       │                          │
   │←─(5) Return EHR───────│                          │
```

### 3. Prediction Generation Flow

```
Frontend        Backend          Database      Prophet Service
   │               │                 │               │
   │─(1) GET────→  │                 │               │
   │  /predict/1   │                 │               │
   │               │                 │               │
   │               │──(2) Fetch─────→│               │
   │               │    EHR records  │               │
   │               │                 │               │
   │               │←─(3) Return─────│               │
   │               │    60 days data │               │
   │               │                 │               │
   │               │──(4) Prepare Data──────────────→│
   │               │    {ds, y}                      │
   │               │                                 │
   │               │──(5) Train Prophet Model───────→│
   │               │                                 │
   │               │──(6) Generate Predictions──────→│
   │               │                                 │
   │               │←─(7) Return Forecast────────────│
   │               │    {predictions, bounds}        │
   │               │                                 │
   │               │──(8) Calculate Risk Levels      │
   │               │──(9) Generate Alerts            │
   │               │                                 │
   │←─(10) Return──│                                 │
   │   {predictions}                                 │
```

### 4. Dashboard Data Flow

```
Frontend                Backend                    Database
   │                       │                          │
   │──(1) GET /dashboard/1→│                          │
   │                       │                          │
   │                       │──(2) Fetch Hospital─────→│
   │                       │──(3) Fetch Latest EHR───→│
   │                       │──(4) Fetch Historical───→│
   │                       │     (30 days)            │
   │                       │                          │
   │                       │←─(5) Return Data─────────│
   │                       │                          │
   │                       │──(6) Generate Predictions│
   │                       │     (Prophet Service)    │
   │                       │                          │
   │                       │──(7) Calculate Metrics   │
   │                       │     • Utilization %      │
   │                       │     • Status (R/Y/G)     │
   │                       │                          │
   │                       │──(8) Generate Alerts     │
   │                       │                          │
   │←─(9) Return Complete──│                          │
   │     Dashboard Data    │                          │
```

---

## 🗄️ Database Schema Detailed

### Entity Relationship Diagram

```
┌──────────────────────────┐
│       hospitals          │
├──────────────────────────┤
│ PK  id (SERIAL)          │
│     hospital_name (VARCHAR)│
│     location (VARCHAR)   │
│     total_beds (INT)     │
│     icu_beds (INT)       │
│     created_at (TIMESTAMP)│
└──────────────┬───────────┘
               │ 1
               │
               │ has many
               │
               │ *
┌──────────────▼───────────┐
│      ehr_records         │
├──────────────────────────┤
│ PK  id (SERIAL)          │
│ FK  hospital_id (INT)    │
│     date (DATE)          │
│     admissions (INT)     │
│     discharges (INT)     │
│     occupied_beds (INT)  │
│     icu_occupied (INT)   │
│     emergency_cases (INT)│
│     created_at (TIMESTAMP)│
└──────────────────────────┘

Indexes:
- hospital_id (for fast lookup)
- date (for time-based queries)
- (hospital_id, date) UNIQUE (no duplicates)
```

### Sample Data

**hospitals table:**
```sql
id | hospital_name           | location      | total_beds | icu_beds
---+------------------------+---------------+------------+----------
1  | St. Mary's General     | New York, NY  | 250        | 30
2  | City Medical Center    | Los Angeles   | 180        | 25
3  | Regional Health Inst.  | Chicago, IL   | 320        | 40
```

**ehr_records table:**
```sql
id | hospital_id | date       | admissions | discharges | occupied_beds | icu_occupied | emergency_cases
---+-------------+------------+------------+------------+---------------+--------------+----------------
1  | 1           | 2026-01-30 | 25         | 20         | 180           | 22           | 8
2  | 1           | 2026-01-31 | 28         | 22         | 186           | 24           | 10
3  | 2           | 2026-01-30 | 18         | 15         | 135           | 18           | 6
```

---

## 🎯 API Endpoint Details

### Authentication
**Current:** None (demo/hackathon version)  
**Production:** Add JWT tokens or API keys

### Rate Limiting
**Current:** None  
**Production:** Implement with FastAPI middleware

### Error Handling

All endpoints return standard error format:
```json
{
  "detail": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

### Endpoint Details

#### `POST /api/hospitals`
**Purpose:** Create new hospital

**Request Body:**
```json
{
  "hospital_name": "Test Hospital",
  "location": "City, State",
  "total_beds": 100,
  "icu_beds": 10
}
```

**Validations:**
- All fields required
- total_beds > 0
- icu_beds >= 0
- icu_beds <= total_beds

**Response:** `201 Created`
```json
{
  "id": 1,
  "hospital_name": "Test Hospital",
  "location": "City, State",
  "total_beds": 100,
  "icu_beds": 10,
  "created_at": "2026-01-30T12:00:00"
}
```

#### `GET /api/hospitals`
**Purpose:** List all hospitals

**Query Parameters:**
- `skip` (int, default=0) - Pagination offset
- `limit` (int, default=100) - Max results

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "hospital_name": "Test Hospital",
    ...
  }
]
```

#### `POST /api/ehr`
**Purpose:** Submit daily EHR record

**Request Body:**
```json
{
  "hospital_id": 1,
  "date": "2026-01-30",
  "admissions": 25,
  "discharges": 20,
  "occupied_beds": 180,
  "icu_occupied": 22,
  "emergency_cases": 8
}
```

**Validations:**
- Hospital must exist
- occupied_beds <= hospital.total_beds
- icu_occupied <= hospital.icu_beds
- No duplicate (hospital_id, date)

#### `GET /api/predict/{hospital_id}?days=7`
**Purpose:** Generate predictions

**Path Parameters:**
- `hospital_id` (int) - Hospital to predict

**Query Parameters:**
- `days` (int, 1-30, default=7) - Prediction horizon

**Response:** `200 OK`
```json
{
  "hospital_id": 1,
  "hospital_name": "Test Hospital",
  "total_beds": 250,
  "predictions": [
    {
      "date": "2026-02-01",
      "predicted_occupancy": 185.5,
      "lower_bound": 175.0,
      "upper_bound": 196.0
    }
  ],
  "model_info": {
    "model": "Prophet",
    "training_samples": 60,
    "date_range": {...},
    "trained_at": "2026-01-30T12:00:00"
  }
}
```

#### `GET /api/dashboard/{hospital_id}`
**Purpose:** Complete dashboard data

**Response:** `200 OK`
```json
{
  "hospital_id": 1,
  "hospital_name": "Test Hospital",
  "location": "City, State",
  "total_beds": 250,
  "icu_beds": 30,
  "current_occupied": 180,
  "current_icu_occupied": 22,
  "current_utilization": 72.0,
  "historical_data": [...],
  "predictions": [...],
  "alerts": [...],
  "overall_status": "green"
}
```

---

## 🤖 ML Model Details

### Prophet Model Configuration

```python
Prophet(
    daily_seasonality=False,      # Not needed for daily aggregates
    weekly_seasonality=True,       # Capture weekend effects
    yearly_seasonality='auto',     # Auto-detect if enough data
    changepoint_prior_scale=0.05,  # Conservative trend changes
    interval_width=0.95            # 95% confidence intervals
)
```

### Training Process

1. **Data Preparation**
   - Extract `date` and `occupied_beds` from EHR records
   - Sort by date
   - Rename columns: `date → ds`, `occupied_beds → y`

2. **Model Training**
   - Fit Prophet model on historical data
   - Automatically detect:
     - Overall trend (increasing/decreasing)
     - Weekly patterns (weekday vs weekend)
     - Seasonal patterns (if 1+ year of data)

3. **Prediction Generation**
   - Create future dates (7 days)
   - Generate forecasts with confidence bounds
   - Post-process: ensure non-negative values

4. **Risk Assessment**
   - Calculate utilization: (predicted / total_beds) × 100
   - Assign severity:
     - `< 70%` → Green (safe)
     - `70-85%` → Yellow (caution)
     - `> 85%` → Red (critical)

### Model Performance

**Typical Metrics:**
- MAPE (Mean Absolute Percentage Error): 5-15%
- Coverage: 95% (predictions within confidence bounds)
- Training Time: < 3 seconds
- Prediction Time: < 1 second

**Accuracy Factors:**
- More historical data → Better accuracy
- Stable patterns → Better accuracy
- Outliers/anomalies → Lower accuracy

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App (src/App.jsx)
└── Dashboard (src/pages/Dashboard.jsx)
    ├── HospitalSelector (src/components/HospitalSelector.jsx)
    ├── MetricCard × 4 (src/components/MetricCard.jsx)
    ├── OccupancyChart (src/components/OccupancyChart.jsx)
    └── AlertsPanel (src/components/AlertsPanel.jsx)
```

### State Management

**Current:** useState + useEffect (sufficient for hackathon)  
**Production:** Consider Redux or Context API for complex state

### API Integration

Centralized in `src/services/api.js`:
- Axios for HTTP requests
- Base URL configuration
- Error handling
- Request/response interceptors (optional)

### Styling

**Tailwind CSS** - Utility-first approach:
- Responsive design (mobile-friendly)
- Color scheme:
  - Primary: Blue (#3b82f6)
  - Success: Green (#10b981)
  - Warning: Yellow (#f59e0b)
  - Danger: Red (#ef4444)

---

## 🚀 Performance Considerations

### Backend Optimization
- Database indexes on frequently queried columns
- Connection pooling (10 connections, 20 max overflow)
- Query optimization with SQLAlchemy
- Prophet model caching (future enhancement)

### Frontend Optimization
- Code splitting with Vite
- Lazy loading components
- Memoization for expensive calculations
- Debouncing API calls

### Scalability
- Horizontal scaling: Multiple FastAPI instances behind load balancer
- Database: PostgreSQL read replicas for scaling reads
- Caching: Redis for prediction results (future)
- CDN: Static assets on CloudFront/Cloudflare

---

## 🔒 Security Considerations

### Current Implementation (Demo)
- CORS: Open to all origins
- No authentication
- No rate limiting
- Database: Local PostgreSQL

### Production Recommendations
1. **Authentication:** JWT tokens or OAuth2
2. **CORS:** Restrict to specific frontend domains
3. **Rate Limiting:** Prevent abuse
4. **SQL Injection:** Protected by SQLAlchemy ORM
5. **Input Validation:** Pydantic schemas
6. **HTTPS:** SSL/TLS encryption
7. **Database:** Encrypted connections, strong passwords
8. **Secrets:** Environment variables, never in code

---

## 📊 Monitoring & Logging

### Recommended Tools
- **Application:** Sentry for error tracking
- **Infrastructure:** Prometheus + Grafana
- **Logs:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime:** UptimeRobot or Pingdom

### Key Metrics to Monitor
- API response times
- Database query performance
- Prediction accuracy over time
- Error rates
- User activity

---

## 🧪 Testing Strategy

### Backend Tests
```python
# Unit tests
def test_hospital_creation():
    # Test model creation
    
def test_prediction_service():
    # Test Prophet predictions

# Integration tests
def test_api_endpoints():
    # Test API with TestClient
```

### Frontend Tests
```javascript
// Component tests (Jest + React Testing Library)
test('MetricCard displays correct values', () => {
  // Test component rendering
});

// E2E tests (Playwright/Cypress)
test('Dashboard loads and displays data', () => {
  // Test full user flow
});
```

---

This architecture is designed for:
- ✅ **Clarity** - Easy to understand and explain
- ✅ **Modularity** - Separated concerns
- ✅ **Scalability** - Can grow with demand
- ✅ **Maintainability** - Clean code, good docs
- ✅ **Demo-ability** - Impressive for hackathons
