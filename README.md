# Table Space — Decarb Strategy

Interactive web application for modeling, simulating, and managing SBTi-aligned decarbonization roadmaps for managed workspace portfolios across India.

## Features

- **Dashboard**: Portfolio overview with KPI tiles, emissions trajectories, and quick actions
- **Portfolio & Sites**: Interactive map and editable table for site management
- **Baseline Builder**: Wizard for configuring FY2025 baseline assumptions
- **SBTi Simulator**: Scenario builder with intervention modeling and compliance checking
- **Prioritization Matrix**: Impact vs. feasibility analysis with NPV calculations
- **Supplier Scorecard**: Sustainability assessment and onboarding workflow
- **Embodied Carbon LCA**: Project-level carbon footprint calculation
- **Tenant Commuting**: Scope 3 emissions tracking and optimization
- **Reports & Exports**: Generate investor-ready PPTX, Excel, and PDF documents

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **Maps**: React Leaflet
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Tables**: TanStack Table
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library, Cypress

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

```
Email: demo@tablespace.com
Password: demo123
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   ├── portfolio/         # Portfolio & Sites
│   ├── baseline/          # Baseline Builder
│   ├── simulator/         # SBTi Simulator
│   ├── prioritization/    # Prioritization Matrix
│   ├── suppliers/         # Supplier Scorecard
│   ├── embodied/          # Embodied Carbon LCA
│   ├── commuting/         # Commuting Tool
│   ├── reports/           # Reports & Exports
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── portfolio/        # Portfolio components
│   └── layout/           # Layout components
├── lib/                   # Utilities and business logic
│   ├── types/            # TypeScript types
│   ├── calculations/     # Emission calculation primitives
│   ├── data/             # Data ingestion
│   ├── exports/          # Export generators (PPTX, Excel)
│   └── store/            # Zustand state management
└── __tests__/            # Test files
```

## Core Calculation Primitives

### Energy Emissions
```typescript
kgCO2e = kWh * emission_factor
```

### Fuel Combustion
```typescript
kgCO2e = liters * density * EF
```

### Refrigerant Fugitive Emissions
```typescript
kgCO2e = kg_refrigerant * GWP * leakage_percent
```

### Embodied Carbon
```typescript
kgCO2e = mass * carbon_factor
```

### Tenant Commuting
```typescript
tCO2e = sum(person_km_by_mode * EF_mode)
```

## SBTi Compliance

The platform implements 1.5°C-aligned pathways with:
- Near-term target: 42% reduction by 2030
- Long-term target: 90% reduction by 2040 (net-zero)

Scenarios are validated against SBTi-compatible trajectories, accounting for:
- Sequential intervention stacking
- Avoidance of double-counting (efficiency before renewables)
- Exclusion of offsets from near-term achievement calculations

## Data Sources

The application can ingest:
- Excel/CSV utility bills
- PDF invoices (with OCR)
- Site configuration data
- Supplier EPDs and GHG inventories

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Deployment

The application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Docker** on AWS/GCP
- Any Node.js hosting platform

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...  # For production
```

## Accessibility

The platform is designed to meet WCAG AA compliance:
- Keyboard navigation support
- ARIA labels on interactive elements
- Minimum 4.5:1 contrast ratio
- Screen reader compatibility

## MVP Acceptance Criteria

✅ App loads demo data and displays KPIs
✅ User can create and simulate scenarios
✅ PPTX and Excel exports functional
✅ Supplier scorecard operational
✅ Code is modular and documented

## Future Enhancements (Phase 2)

- CRREM integration
- Multi-user collaboration
- Real-time utility API integrations
- Advanced financial modeling
- Mobile app

## License

Proprietary - Table Space

## Support

For questions or issues, contact: support@tablespace.com

