# Relay Database Migration Plan

## Phase 1: Local PostgreSQL Setup

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb relay_dev
```

### 2. Update Django Settings

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'relay_dev',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 3. Install Dependencies

```bash
pip install psycopg2-binary
pip install django-environ  # For environment variables
```

### 4. Data Migration

```bash
# Export from SQLite
python manage.py dumpdata > data_backup.json

# Migrate to PostgreSQL
python manage.py migrate
python manage.py loaddata data_backup.json
```

## Phase 2: Deployment Setup

### Railway Deployment

1. Connect GitHub repository
2. Add environment variables:
   - DATABASE_URL (auto-provided)
   - REDIS_URL (auto-provided)
   - SECRET_KEY
   - ALLOWED_HOSTS
3. Deploy automatically on git push

### Recommended Environment Variables

```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.railway.app,localhost
DATABASE_URL=postgresql://... (auto-provided)
REDIS_URL=redis://... (auto-provided)
```
