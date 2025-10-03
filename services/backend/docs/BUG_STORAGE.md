# Bug Report Storage

This document explains how bug report storage works in the Flowgen backend.

## Overview

Bug reports can be stored in two locations:

1. **Local File System** - For development and testing
2. **Google Cloud Storage (GCS)** - For production deployments

## Configuration

The storage backend is controlled by environment variables in your `.env` file:

```bash
# Data configuration
BUGS_DIR=bugs                      # Local directory for bug reports
USE_GCS_FOR_BUGS=false            # Set to true to use GCS instead of local storage
GCS_BUGS_BUCKET=flowgen           # GCS bucket name
GCS_BUGS_PATH=bugs                # Path within the bucket
```

## Local Storage (Development)

**When to use**: Development, testing, local deployments

**Configuration**:

```bash
USE_GCS_FOR_BUGS=false
BUGS_DIR=bugs
```

**Behavior**:

- Bug reports are stored in `bugs/bug_reports.jsonl`
- Each bug report is a single line in JSONL format
- File is created automatically if it doesn't exist
- In production environment, uses `/tmp/bugs` to avoid permission issues on Cloud Run

## Google Cloud Storage (Production)

**When to use**: Production deployments on Cloud Run

**Configuration**:

```bash
USE_GCS_FOR_BUGS=true
GCS_BUGS_BUCKET=flowgen
GCS_BUGS_PATH=bugs
```

**Behavior**:

- Bug reports are stored in `gs://flowgen/bugs/bug_reports.jsonl`
- All bug reports are in a single JSONL file
- File is created automatically if it doesn't exist
- Persistent across Cloud Run instance restarts

**GCS Bucket Setup**:

1. The bucket should already exist: `gs://flowgen`
2. Ensure your Cloud Run service account has permissions:
   ```bash
   # Grant Storage Object Admin role to Cloud Run service account
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.objectAdmin"
   ```

## Storage Architecture

Both backends implement the same interface (`BugStorageBackend`):

```python
class BugStorageBackend(ABC):
    async def save_bug(self, bug_data: dict[str, Any]) -> None
    async def list_bugs(self) -> list[dict[str, Any]]
    async def get_bug(self, bug_id: str) -> dict[str, Any] | None
```

## API Endpoints

All endpoints work the same regardless of storage backend:

- `POST /api/v1/bugs/report` - Submit a bug report
- `GET /api/v1/bugs/list` - List all bug reports (summary)
- `GET /api/v1/bugs/{bug_id}` - Get a specific bug report (full details)

## Deployment

### Local Development

```bash
# .env
USE_GCS_FOR_BUGS=false
BUGS_DIR=bugs
```

### Cloud Run Deployment

The deployment script automatically configures GCS storage:

```bash
./scripts/deploy-gcloud.sh
```

This sets:

- `USE_GCS_FOR_BUGS=true`
- `GCS_BUGS_BUCKET=flowgen`
- `GCS_BUGS_PATH=bugs`

## Monitoring

Bug reports are logged with appropriate log levels:

```python
# When saving a bug
_logger.info(f"Saved bug report {bug_id} to GCS gs://flowgen/bugs/bug_reports.jsonl")

# On errors
_logger.error(f"Failed to save bug to GCS: {error}")
```

## File Format

Bug reports are stored in JSONL (JSON Lines) format:

```json
{"bug_id": "123e4567-e89b-12d3-a456-426614174000", "timestamp": "2025-01-15T10:30:00", ...}
{"bug_id": "223e4567-e89b-12d3-a456-426614174001", "timestamp": "2025-01-15T11:45:00", ...}
```

Each line is a complete JSON object representing one bug report.

## Switching Storage Backends

To switch from local to GCS (or vice versa):

1. Update the `.env` file with desired configuration
2. Restart the backend server
3. No data migration needed - backends are independent

**Note**: Existing bug reports in one backend will not automatically appear in the other backend. They are separate storage systems.

## Performance Considerations

### Local Storage

- ✅ Fast writes (append to file)
- ✅ Simple setup
- ❌ Lost on container restart (Cloud Run)
- ❌ Not shared across instances

### GCS Storage

- ✅ Persistent across restarts
- ✅ Shared across all instances
- ✅ Centralized storage
- ⚠️ Slightly slower due to network calls
- ⚠️ Read-modify-write pattern for appending

## Troubleshooting

### Permission Errors (GCS)

```
Error: Failed to save bug to GCS: 403 Forbidden
```

**Solution**: Ensure Cloud Run service account has `storage.objectAdmin` role on the bucket.

### Bucket Not Found

```
Error: Failed to save bug to GCS: 404 Not Found
```

**Solution**: Create the bucket or update `GCS_BUGS_BUCKET` to an existing bucket name.

### Local File Permission Errors

```
Error: Failed to save bug: Permission denied
```

**Solution**: Check `BUGS_DIR` permissions. In production, the system automatically uses `/tmp/bugs`.
