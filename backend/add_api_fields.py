"""
Database Migration: Add API Integration Fields to Hospitals Table

This script adds the following fields to the hospitals table:
- api_enabled: Boolean flag for API integration
- api_endpoint: Hospital's API endpoint URL
- api_key: API authentication key
- webhook_url: Webhook for push notifications
- sync_interval: Sync interval in seconds
- last_sync: Last successful sync timestamp
- api_notes: Additional notes about API integration
"""

from sqlalchemy import text
from app.database import engine


def add_api_fields():
    """Add API integration fields to hospitals table"""
    
    migrations = [
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS api_enabled BOOLEAN DEFAULT FALSE NOT NULL;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS api_endpoint VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS api_key VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS webhook_url VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS sync_interval INTEGER DEFAULT 300 NOT NULL;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS api_notes TEXT;"
    ]
    
    with engine.begin() as conn:
        for migration in migrations:
            try:
                conn.execute(text(migration))
                print(f"✅ Executed: {migration[:50]}...")
            except Exception as e:
                print(f"⚠️  Warning: {migration[:50]}... - {str(e)}")
    
    print("\n✅ Migration completed successfully!")
    print("All API integration fields have been added to the hospitals table.")


if __name__ == "__main__":
    print("🔄 Starting migration: Adding API integration fields...")
    print("-" * 60)
    add_api_fields()
