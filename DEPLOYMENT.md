# Deployment Guide - Table Space Decarb Strategy

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Environment Variables**
Set in Vercel dashboard:
```
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Option 2: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and Run**
```bash
docker build -t tablespace-decarb .
docker run -p 3000:3000 tablespace-decarb
```

### Option 3: Traditional Node.js Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Configuration

Create `.env.local` file:

```env
# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (optional for MVP)
DATABASE_URL=postgresql://user:password@localhost:5432/tablespace

# AWS S3 (for file uploads in production)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=tablespace-uploads
```

## Production Checklist

- [ ] Set secure NEXTAUTH_SECRET
- [ ] Configure production database
- [ ] Set up file upload storage (S3/Azure)
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backup strategy
- [ ] Enable rate limiting
- [ ] Set up CI/CD pipeline

## Database Setup (Production)

For production, replace in-memory data with PostgreSQL:

```sql
-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  area_square_feet INTEGER,
  occupancy INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  measured_kwh DECIMAL(15, 2),
  benchmark_eui DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scenarios table
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  baseline_year INTEGER,
  target_year INTEGER,
  near_term_target_percent DECIMAL(5, 2),
  long_term_target_percent DECIMAL(5, 2),
  sbti_compliant BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  score INTEGER,
  status VARCHAR(50),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_sites_state ON sites(state);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_scenarios_baseline_year ON scenarios(baseline_year);
```

## Performance Optimization

1. **Enable Next.js caching**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

2. **Use CDN for static assets**
- Upload images, fonts to CDN
- Configure Next.js to use CDN URLs

3. **Enable compression**
- Gzip/Brotli on server
- Image optimization

## Monitoring & Analytics

Recommended tools:
- **Error tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Performance**: Vercel Analytics, Lighthouse CI
- **Uptime**: UptimeRobot, Pingdom

## Security Best Practices

1. Keep dependencies updated
```bash
npm audit fix
```

2. Use environment variables for secrets
3. Implement rate limiting
4. Enable CORS properly
5. Use HTTPS everywhere
6. Implement CSP headers

## Backup Strategy

- Database: Daily automated backups
- Files: S3 versioning enabled
- Code: Git with multiple remotes

## Support & Maintenance

- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security audit quarterly

