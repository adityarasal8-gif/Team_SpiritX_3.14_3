# Database Setup Guide

## PostgreSQL Installation & Configuration

### Windows Installation

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14 or later
   - Run installer

2. **Installation Steps**
   - Choose installation directory
   - Select components: PostgreSQL Server, pgAdmin, Command Line Tools
   - Set password for postgres user (remember this!)
   - Port: 5432 (default)
   - Locale: Default

3. **Verify Installation**
   ```powershell
   # Check if PostgreSQL is running
   pg_isready
   
   # Should output: accepting connections
   ```

### Database Creation

**Option 1: Using psql (Command Line)**
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE hospital_db;

# Verify
\l

# Exit
\q
```

**Option 2: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to PostgreSQL Server (localhost)
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `hospital_db`
5. Owner: postgres
6. Click "Save"

### Configure Backend Connection

1. **Navigate to backend folder**
   ```powershell
   cd backend
   ```

2. **Create .env file**
   ```powershell
   copy .env.example .env
   ```

3. **Edit .env file**
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_db
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

### Test Connection

```powershell
# Install dependencies first
pip install -r requirements.txt

# Test connection
python -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
```

---

## Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to PATH

1. Find PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\14\bin`)
2. Add to System Environment Variables:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Edit "Path" → Add new: `C:\Program Files\PostgreSQL\14\bin`
3. Restart PowerShell

### Issue 2: "FATAL: password authentication failed"

**Solution:** Check password in .env file

```powershell
# Test with psql
psql -U postgres -d hospital_db

# If it works here, check DATABASE_URL in .env
```

### Issue 3: "database does not exist"

**Solution:** Create the database

```powershell
psql -U postgres -c "CREATE DATABASE hospital_db;"
```

### Issue 4: "could not connect to server"

**Solution:** Start PostgreSQL service

```powershell
# Check status
pg_isready

# Start service (Windows)
net start postgresql-x64-14

# Or use Services app: services.msc → PostgreSQL → Start
```

### Issue 5: Port 5432 already in use

**Solution:** Find what's using the port

```powershell
# Find process on port 5432
netstat -ano | findstr :5432

# Kill process if needed (replace PID)
taskkill /PID <PID> /F

# Or change port in DATABASE_URL
```

---

## Database Schema Setup

The application automatically creates tables when you first run it:

```python
# In app/main.py
Base.metadata.create_all(bind=engine)
```

This creates:
- `hospitals` table
- `ehr_records` table
- Foreign key relationships
- Indexes

### Manual Schema Creation (if needed)

```sql
-- Create hospitals table
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    total_beds INTEGER NOT NULL,
    icu_beds INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ehr_records table
CREATE TABLE ehr_records (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
    date DATE NOT NULL,
    admissions INTEGER NOT NULL DEFAULT 0,
    discharges INTEGER NOT NULL DEFAULT 0,
    occupied_beds INTEGER NOT NULL,
    icu_occupied INTEGER NOT NULL DEFAULT 0,
    emergency_cases INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, date)
);

-- Create indexes
CREATE INDEX idx_ehr_hospital_id ON ehr_records(hospital_id);
CREATE INDEX idx_ehr_date ON ehr_records(date);
```

---

## Database Management

### View Data

```sql
-- Connect to database
psql -U postgres -d hospital_db

-- View all hospitals
SELECT * FROM hospitals;

-- View recent EHR records
SELECT * FROM ehr_records ORDER BY date DESC LIMIT 10;

-- View occupancy stats
SELECT 
    h.hospital_name,
    COUNT(e.id) as record_count,
    AVG(e.occupied_beds) as avg_occupancy,
    MAX(e.occupied_beds) as max_occupancy
FROM hospitals h
LEFT JOIN ehr_records e ON h.id = e.hospital_id
GROUP BY h.hospital_name;
```

### Clear Data

```sql
-- Delete all EHR records
TRUNCATE TABLE ehr_records;

-- Delete all hospitals (and cascade to EHR records)
TRUNCATE TABLE hospitals CASCADE;

-- Or drop and recreate database
DROP DATABASE hospital_db;
CREATE DATABASE hospital_db;
```

### Backup & Restore

**Backup:**
```powershell
# Backup database
pg_dump -U postgres hospital_db > backup.sql

# Backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump -U postgres hospital_db > "backup_$timestamp.sql"
```

**Restore:**
```powershell
# Restore from backup
psql -U postgres hospital_db < backup.sql
```

---

## Advanced Configuration

### Connection Pooling

The application uses SQLAlchemy connection pooling:

```python
# In database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=10,        # 10 persistent connections
    max_overflow=20,     # 20 additional connections if needed
    pool_pre_ping=True   # Verify connections before use
)
```

### Performance Tuning

**PostgreSQL Configuration** (`postgresql.conf`):

```ini
# For development
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 6MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Remote Access (Optional)

To allow remote connections:

1. **Edit `postgresql.conf`:**
   ```ini
   listen_addresses = '*'
   ```

2. **Edit `pg_hba.conf`:**
   ```
   host    all    all    0.0.0.0/0    md5
   ```

3. **Restart PostgreSQL**

4. **Update DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://postgres:password@your-server-ip:5432/hospital_db
   ```

---

## Cloud Database Options

### Option 1: Render PostgreSQL (Recommended for Hackathons)

1. Sign up at https://render.com
2. Create new PostgreSQL database
3. Copy connection string
4. Update .env:
   ```
   DATABASE_URL=postgresql://user:pass@host.render.com/database
   ```

### Option 2: AWS RDS

1. Create RDS PostgreSQL instance
2. Configure security groups
3. Copy endpoint
4. Update .env

### Option 3: Heroku Postgres

1. Create Heroku app
2. Add Heroku Postgres addon
3. Copy DATABASE_URL from config vars
4. Update .env

### Option 4: ElephantSQL (Free Tier)

1. Sign up at https://www.elephantsql.com
2. Create new instance (Tiny Turtle - Free)
3. Copy URL
4. Update .env

---

## Monitoring & Maintenance

### Check Database Size

```sql
SELECT 
    pg_size_pretty(pg_database_size('hospital_db')) as size;
```

### Check Table Sizes

```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View Active Connections

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'hospital_db';
```

### Vacuum and Analyze

```sql
-- Optimize database performance
VACUUM ANALYZE;

-- For specific tables
VACUUM ANALYZE hospitals;
VACUUM ANALYZE ehr_records;
```

---

## Security Best Practices

### 1. Strong Passwords
```powershell
# Generate strong password (PowerShell)
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(16, 4)
```

### 2. Restrict Access
- Don't expose PostgreSQL to internet
- Use firewall rules
- Change default port if needed

### 3. Regular Backups
```powershell
# Automated backup script (save as backup.ps1)
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump -U postgres hospital_db > "backup_$timestamp.sql"

# Schedule with Task Scheduler
```

### 4. Environment Variables
- Never commit .env file to git
- Use different credentials for dev/prod
- Rotate passwords regularly

---

## Quick Reference

### Useful Commands

```powershell
# Check PostgreSQL version
psql --version

# Check if server is running
pg_isready

# Connect to database
psql -U postgres -d hospital_db

# List databases
psql -U postgres -c "\l"

# List tables
psql -U postgres -d hospital_db -c "\dt"

# Execute SQL file
psql -U postgres -d hospital_db -f script.sql

# Start PostgreSQL service
net start postgresql-x64-14

# Stop PostgreSQL service
net stop postgresql-x64-14
```

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]

Examples:
Local:  postgresql://postgres:password@localhost:5432/hospital_db
Remote: postgresql://user:pass@example.com:5432/hospital_db
Render: postgresql://user:pass@dpg-xyz.render.com/hospital_db
```

---

## Need Help?

1. **PostgreSQL Documentation:** https://www.postgresql.org/docs/
2. **Stack Overflow:** Search for "postgresql [your error]"
3. **Check logs:** Usually in PostgreSQL data directory
4. **Test connection:** Use pgAdmin or psql

---

**You're all set! Your database is ready for the hospital bed occupancy system. 🎉**
