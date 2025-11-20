# Quick Start Guide - Table Space Decarb Strategy

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Login

Use these demo credentials:
```
Email: demo@tablespace.com
Password: demo123
```

## 📊 What You'll See

### Dashboard
- **Portfolio Overview**: 3 demo sites across India (Mumbai, Delhi, Bangalore)
- **Emissions KPIs**: Real-time calculations of Scope 1, 2, 3 emissions
- **Charts**: Interactive emissions trajectory with SBTi targets
- **Quick Actions**: Create scenarios, add sites, generate reports

### Explore Features

**Portfolio & Sites** (`/portfolio`)
- Interactive map showing all sites
- Click markers to view site details
- Switch to table view for detailed data
- 3 pre-loaded sites with realistic data

**SBTi Simulator** (`/simulator`)
- Create decarbonization scenarios
- Add interventions (LED retrofits, solar, HVAC upgrades)
- Run simulations to see year-by-year emissions
- Check SBTi compliance (42% by 2030, 90% by 2040)

**Supplier Scorecard** (`/suppliers`)
- 2 pre-loaded suppliers with scores
- View sustainability criteria (EPD, GHG inventory, net-zero commitment)
- Approve/reject suppliers based on scores
- Generate procurement RFPs

**Embodied Carbon LCA** (`/embodied`)
- Calculate project-level carbon footprint
- Add materials (concrete, steel, glass, etc.)
- Set carbon budgets and track compliance
- Get optimization recommendations

**Reports & Exports** (`/reports`)
- Generate PowerPoint presentations (6 slides)
- Export Excel workbooks (5 worksheets)
- Create SBTi submission packs
- View data gaps report

## 🎯 Try These Workflows

### Workflow 1: Create Your First Scenario (5 minutes)

1. Go to **SBTi Simulator** (`/simulator`)
2. Click "Add Intervention"
3. Configure an intervention:
   - Name: "LED Lighting Retrofit"
   - Category: Energy Efficiency
   - Energy Savings: 15%
   - Implementation Year: 2026
   - CAPEX: ₹50,00,000
4. Click "Run Simulation"
5. Check if scenario meets SBTi targets
6. Click "Save Scenario"

### Workflow 2: Generate Investor Report (2 minutes)

1. Go to **Reports & Exports** (`/reports`)
2. Click "Download PPTX" under Investor Presentation
3. Wait 1-2 seconds for generation
4. Open the downloaded PowerPoint file
5. Review 6 slides with portfolio data, charts, and targets

### Workflow 3: Onboard a Supplier (3 minutes)

1. Go to **Supplier Scorecard** (`/suppliers`)
2. Click "Add Supplier"
3. Enter supplier details
4. Check applicable criteria:
   - ✓ Has EPD (30 points)
   - ✓ Has GHG Inventory (25 points)
   - ✓ Net-Zero Commitment (25 points)
   - ✓ Circularity Program (20 points)
5. Score is calculated automatically
6. Suppliers with 70+ points are auto-approved

### Workflow 4: Calculate Project Embodied Carbon (3 minutes)

1. Go to **Embodied Carbon LCA** (`/embodied`)
2. Enter project details (name, area, budget)
3. Click "Add Material" → Select "Concrete"
4. Enter quantity: 100,000 kg
5. Set reuse percentage: 10%
6. Add more materials (steel, glass)
7. View total embodied carbon and budget status
8. Get recommendations if over budget

## 📁 Project Structure

```
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── portfolio/         # Portfolio & Sites
│   ├── simulator/         # SBTi Simulator
│   ├── suppliers/         # Supplier Scorecard
│   ├── embodied/          # Embodied Carbon LCA
│   ├── reports/           # Reports & Exports
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Business logic
│   ├── calculations/      # Emission calculators
│   ├── exports/          # PPTX/Excel generators
│   └── store/            # State management
└── __tests__/            # Tests
```

## 🧪 Run Tests

```bash
# Unit tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 📚 Key Features Demonstrated

### Calculation Primitives
- ✅ Energy emissions: `kgCO2e = kWh × emission_factor`
- ✅ Fuel combustion: `kgCO2e = liters × density × EF`
- ✅ Refrigerant fugitive: `kgCO2e = kg × GWP`
- ✅ Embodied carbon: `kgCO2e = mass × CF`
- ✅ Commuting: `tCO2e = Σ(person-km × EF_mode)`

### SBTi Compliance
- ✅ 1.5°C-aligned pathway
- ✅ 42% reduction by 2030 (near-term)
- ✅ 90% reduction by 2040 (net-zero)
- ✅ Scenario validation
- ✅ Double-counting prevention

### Data Management
- ✅ 3 demo sites (Mumbai, Delhi, Bangalore)
- ✅ Portfolio-level aggregation
- ✅ State-specific grid factors
- ✅ Site-level solar and energy data
- ✅ Refrigerant tracking (R-410A, R-32)

### Export Capabilities
- ✅ PowerPoint (PPTX) - 6 slides
- ✅ Excel (XLSX) - 5 worksheets
- ✅ Investor-ready formatting
- ✅ Charts and tables
- ✅ SBTi evidence pack

## 🎨 UI/UX Highlights

- **Clean Design**: Neutral colors with status indicators
- **Responsive**: Works on desktop, tablet, mobile
- **Accessible**: WCAG AA compliant, keyboard navigation
- **Interactive**: Hover tooltips, sortable tables, zoomable charts
- **Fast**: Optimized performance, <3s load time

## 🔧 Troubleshooting

**Build fails?**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Port already in use?**
```bash
# Use different port
npm run dev -- -p 3001
```

**Auth not working?**
- Make sure you're using: `demo@tablespace.com` / `demo123`
- Clear browser cookies and try again

## 📞 Support

Questions or issues? Check:
- `README.md` - Full documentation
- `PROJECT_SUMMARY.md` - Complete feature list
- `DEPLOYMENT.md` - Production deployment guide

## 🎉 You're Ready!

Explore the app, create scenarios, and generate reports. The demo data is fully functional and demonstrates all MVP features.

**Happy decarbonizing! 🌱**

