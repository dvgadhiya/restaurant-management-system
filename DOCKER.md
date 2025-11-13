# Restaurant RMS - Docker Deployment

## Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose

### Running the Application

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd restaurant-rms
   ```

2. **Build and start the container**
   ```bash
   docker-compose up --build
   ```

   First build may take 2-3 minutes. Subsequent runs are faster.

3. **Access the application**
   - Open browser: http://localhost:3000
   - Login page will be displayed

4. **Stop the application**
   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

Edit `docker-compose.yml` to set:
- `NEXTAUTH_SECRET` - Change from default for production
- `NEXTAUTH_URL` - Set to your domain in production
- `DATABASE_URL` - Default uses SQLite file

### Production Deployment

For production, set secure environment variables:

```bash
docker-compose -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=<your-secure-secret> \
  -e NEXTAUTH_URL=https://yourdomain.com \
  up -d
```

## Database

- SQLite database stored in `./prisma/dev.db`
- Persists across container restarts via volume mount
- Migrations run automatically on container startup

## Troubleshooting

### Port Already in Use
If port 3000 is occupied, change in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Access at http://localhost:8080
```

### Database Issues
To reset the database:
```bash
docker-compose down -v  # Remove all volumes
docker-compose up --build
```

### View Logs
```bash
docker-compose logs -f app
```

## Performance Notes

- Multi-stage build optimizes image size (~500MB)
- Production dependencies only in runtime image
- Database volume for persistence
- Health checks enabled for automatic recovery

## Default Credentials (After Seeding)

After first run, manager can seed database with test users:
- Access `/manager/user-requests` to approve pending registrations
- Or use the seed script for demo data
