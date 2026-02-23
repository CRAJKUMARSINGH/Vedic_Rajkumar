# User Data Save Features

## New Features Added

### 1. User Profile Management
- **Profile Dialog**: Click the "Profile" button in the header to manage your profile
- **Save Personal Info**: Optional name, email, and default location
- **Persistent Storage**: All data saved in browser's local storage

### 2. Birth Details Auto-Save
- **Automatic Saving**: Birth details are automatically saved when you submit
- **Quick Access**: Dropdown in the form shows your last 5 birth details
- **One-Click Load**: Select from saved details to quickly fill the form

### 3. Data Backup & Restore
- **Export Data**: Download all your readings and profile as JSON file
- **Import Data**: Restore data from a previously exported file
- **Local Storage Fallback**: If Supabase is unavailable, data saves locally
- **Dual Storage**: Readings saved to both Supabase and local storage

### 4. Enhanced Reading Storage
- **Automatic Backup**: Every reading saved to local storage as backup
- **Offline Support**: Works even when database is unavailable
- **History Limit**: Keeps last 50 readings in local storage

## How to Use

### Save Your Profile
1. Click "Profile" button in header
2. Enter your name, email (optional)
3. Set default location
4. Click "Save"

### Use Saved Birth Details
1. In the birth input form, look for "Use Saved Details" dropdown
2. Select from your previously entered details
3. Form auto-fills with selected data

### Export Your Data
1. Open Profile dialog
2. Click "Export" button
3. JSON file downloads with all your data
4. Save this file for backup

### Import Your Data
1. Open Profile dialog
2. Click "Import" button
3. Select your previously exported JSON file
4. All data restored

## Data Storage

### Local Storage Keys
- `vedic_user_profile`: User profile data
- `vedic_readings_backup`: Last 50 transit readings

### Supabase Table
- `transit_readings`: All readings with full details

## Privacy & Security
- All data stored locally in your browser
- No authentication required
- Export/import for data portability
- Clear browser data to remove all local storage
