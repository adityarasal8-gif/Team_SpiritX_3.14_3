# API Integration Guide

## Overview

The Hospital Bed Occupancy Prediction System now supports **real-time API integration** for hospitals. This allows hospitals to connect their existing EHR (Electronic Health Record) systems directly to our platform for automatic, seamless bed occupancy data synchronization.

## Benefits

✅ **Real-Time Updates**: Bed occupancy data syncs automatically from your EHR system
✅ **No Manual Entry**: Eliminates the need for manual data entry
✅ **Faster Predictions**: More frequent data = More accurate ML predictions
✅ **Reduced Errors**: Automated sync reduces human error
✅ **Time-Saving**: Staff can focus on patient care instead of data entry

## Features

### 1. **API Endpoint Configuration**
- Connect your hospital's EHR API endpoint
- Secure authentication with API keys
- Configurable sync intervals (1 min to 1 hour)

### 2. **Manual Sync Trigger**
- On-demand sync button for immediate data updates
- Real-time feedback with toast notifications

### 3. **Webhook Support**
- Configure webhooks for push notifications
- Receive alerts when occupancy changes significantly

### 4. **Sync Status Monitoring**
- Visual indicators showing API connection status
- Last sync timestamp display
- Success/failure notifications

## How to Configure

### For Hospital Administrators:

1. **Navigate to Hospitals Page**
   - Click on "Hospitals" in the sidebar

2. **Select Hospital**
   - Find your hospital card
   - Click the Settings (⚙️) icon in the API Integration section

3. **Enable API Integration**
   - Toggle "Enable API Integration" to ON

4. **Configure API Settings**:
   - **API Endpoint URL** (Required): Your EHR system's API endpoint
     ```
     Example: https://your-hospital-ehr.com/api/occupancy
     ```
   
   - **API Key / Bearer Token** (Optional): Authentication key
     ```
     Your API authentication token for secure access
     ```
   
   - **Webhook URL** (Optional): For push notifications
     ```
     Example: https://your-hospital-ehr.com/webhooks/occupancy-updates
     ```
   
   - **Sync Interval**: How often to fetch data
     - Every 1 minute (High frequency)
     - Every 5 minutes (Recommended)
     - Every 10 minutes
     - Every 30 minutes
     - Every hour

   - **Additional Notes**: Any relevant information about your API

5. **Save Configuration**
   - Click "Save Configuration"
   - Test with "Sync Now" button

## API Response Format

Your hospital's API endpoint must return data in the following JSON format:

```json
{
  "date": "2026-01-31",
  "occupied_beds": 150,
  "icu_occupied": 20,
  "admissions": 15,
  "discharges": 12,
  "emergency_cases": 8
}
```

### Field Descriptions:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | String (YYYY-MM-DD) | Yes | Date of the record |
| `occupied_beds` | Integer | Yes | Total beds currently occupied |
| `icu_occupied` | Integer | Yes | ICU beds currently occupied |
| `admissions` | Integer | Yes | Number of new admissions today |
| `discharges` | Integer | Yes | Number of discharges today |
| `emergency_cases` | Integer | Yes | Number of emergency cases today |

## Authentication

If your API requires authentication, the system will send requests with the following header:

```http
Authorization: Bearer YOUR_API_KEY
```

Make sure your API endpoint accepts this authentication method.

## Manual Sync

Even with automatic sync enabled, you can manually trigger a sync anytime:

1. Go to Hospitals page
2. Find your hospital card
3. Click the **"Sync"** button (⚡ icon)
4. Wait for success notification

## API Integration Status

### Visual Indicators:

- **🟢 API Connected**: Green WiFi icon - Integration active and working
- **⚪ No API Integration**: Gray WiFi-off icon - Not configured
- **🕐 Last Sync**: Timestamp showing when data was last updated

## Troubleshooting

### Common Issues:

**1. "Sync failed: Connection timeout"**
- Check if your API endpoint is accessible
- Verify the URL is correct
- Ensure your server allows our requests

**2. "Authentication failed"**
- Verify your API key is correct
- Check if the API key has proper permissions
- Ensure the API key hasn't expired

**3. "Invalid response format"**
- Check if your API returns the correct JSON format
- All required fields must be present
- Date format must be YYYY-MM-DD

**4. "API integration not enabled"**
- Make sure you've toggled "Enable API Integration" to ON
- Save the configuration before trying to sync

## Security Best Practices

✅ **Use HTTPS**: Always use HTTPS for your API endpoints
✅ **Rotate Keys**: Regularly rotate your API keys
✅ **Limit Access**: Only allow access from our server IP
✅ **Monitor Logs**: Keep track of API access logs
✅ **Encrypt Data**: Ensure sensitive data is encrypted in transit

## API Endpoints (Our Platform)

### Configure API Integration
```http
PUT /api/hospitals/{hospital_id}/api-config
Authorization: Bearer {token}
Content-Type: application/json

{
  "api_enabled": true,
  "api_endpoint": "https://your-api.com/occupancy",
  "api_key": "your-api-key",
  "webhook_url": "https://your-api.com/webhooks",
  "sync_interval": 300,
  "api_notes": "Production EHR system"
}
```

### Trigger Manual Sync
```http
POST /api/hospitals/{hospital_id}/sync
Authorization: Bearer {token}
```

## Example Integration

### Sample Hospital EHR API Endpoint

Here's a simple example of what your hospital's API endpoint might look like:

```python
# Example Flask endpoint
@app.route('/api/occupancy', methods=['GET'])
def get_occupancy():
    # Verify API key
    api_key = request.headers.get('Authorization')
    if not verify_api_key(api_key):
        return {'error': 'Unauthorized'}, 401
    
    # Get current occupancy from your EHR system
    occupancy_data = get_current_occupancy_from_ehr()
    
    return {
        'date': date.today().isoformat(),
        'occupied_beds': occupancy_data['occupied'],
        'icu_occupied': occupancy_data['icu_occupied'],
        'admissions': occupancy_data['admissions'],
        'discharges': occupancy_data['discharges'],
        'emergency_cases': occupancy_data['emergency']
    }
```

## Support

If you encounter any issues setting up API integration:

1. Check the API Response Format section
2. Review Troubleshooting section
3. Contact technical support with:
   - Hospital name
   - Error message
   - API endpoint (without sensitive data)
   - Last sync attempt timestamp

## Future Enhancements

Coming soon:
- 🔄 Bidirectional sync (send predictions back to your EHR)
- 📊 API usage analytics and monitoring
- 🔔 Advanced webhook events
- 🔐 OAuth 2.0 authentication support
- 📈 Historical sync logs and audit trails

---

**Last Updated**: January 31, 2026
**Version**: 1.0.0
