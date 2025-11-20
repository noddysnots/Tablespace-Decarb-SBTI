# 🧪 Testing Instructions - All Features Working!

## ✅ Development Server Running

Your app is now running at: **http://localhost:3000**

## 🔐 Login
```
Email: demo@tablespace.com
Password: demo123
```

## 🎯 Feature Testing Guide

### 1. TEST SIMULATOR (Main Feature - 20% & 40% Scenarios) ⭐

**Steps:**
1. Navigate to **http://localhost:3000/simulator**
2. You'll see 2 big cards:
   - **Moderate Scenario** (20% reduction)
   - **Aggressive Scenario** (40% reduction)
3. Click **"Load Moderate Scenario"**
4. See 3 interventions automatically loaded
5. Click **"Run Simulation"** button
6. Watch the animation (spinning loader)
7. **See Results:**
   - ✅ Emissions chart with trajectory
   - ✅ SBTi compliance status (✓ or ✗)
   - ✅ Progress bars for 2030/2040 targets
   - ✅ Intervention count: 3
   - ✅ Total CAPEX: ₹1.65 Cr
   - ✅ Annual savings: ₹4.5 Cr

**Try Aggressive Scenario:**
1. Reload the page
2. Click **"Load Aggressive Scenario"**
3. See 5 interventions loaded
4. Click **"Run Simulation"**
5. See ~40% reduction achieved

**Expected Results:**
- Moderate: ~20-25% reduction ✅
- Aggressive: ~40-45% reduction ✅
- Progress bars showing % toward targets ✅
- Green checkmark if compliant ✅
- Red X with recommendations if not compliant ✅

### 2. TEST EMBODIED CARBON LCA ⭐

**Steps:**
1. Go to **http://localhost:3000/embodied**
2. You'll see a Quick Start Guide
3. Click **"Load Typical Fit-out"** card
4. See 6 materials automatically populated:
   - Concrete: 50,000 kg
   - Steel: 15,000 kg
   - Glass: 8,000 kg
   - Aluminum: 2,000 kg
   - Timber: 10,000 kg
   - Drywall: 12,000 kg
5. **Total embodied carbon calculated instantly!**
6. Try changing a quantity:
   - Update Concrete to 100,000 kg
   - Watch emissions recalculate in real-time
7. Add reuse percentage:
   - Set Steel reuse to 20%
   - See emissions reduce automatically

**Expected Results:**
- Total embodied carbon: ~120,000 kgCO₂e ✅
- Per sqft: ~12 kgCO₂e/sqft ✅
- Budget status: Green (under 15 kgCO₂e/sqft limit) ✅
- Real-time updates as you type ✅

### 3. TEST DASHBOARD

**Steps:**
1. Go to **http://localhost:3000**
2. See KPI tiles with live data:
   - Total Emissions: ~1,000 tCO₂e
   - EUI: ~15 kWh/sqft/yr
   - Renewable Energy: ~2-3%
   - Suppliers: 2 onboarded
3. See emissions trajectory chart
4. See portfolio summary (3 sites)

**Expected Results:**
- All tiles showing data ✅
- Chart displaying properly ✅
- Quick actions working ✅

### 4. TEST PORTFOLIO MAP

**Steps:**
1. Go to **http://localhost:3000/portfolio**
2. See interactive map with 3 sites:
   - Mumbai (largest circle)
   - Delhi (medium circle)
   - Bangalore (medium circle)
3. Click on any site marker
4. See popup with site details

**Switch to Table View:**
1. Click **"Table View"** button
2. See sortable table with all site data
3. Click column headers to sort

**Expected Results:**
- Map loads with 3 markers ✅
- Popups show site info ✅
- Table is sortable ✅

### 5. TEST SUPPLIER SCORECARD

**Steps:**
1. Go to **http://localhost:3000/suppliers**
2. See 2 suppliers:
   - Green Building Materials Ltd: 85/100 (Approved) ✅
   - EcoTech HVAC Solutions: 75/100 (Approved) ✅
3. See criteria checkmarks:
   - EPD Available ✅
   - GHG Inventory ✅
   - Net-Zero Commitment ✅
   - Circularity Program ✅
4. See scoring criteria at bottom (30+25+25+20 = 100 points)

**Expected Results:**
- Scores calculated correctly ✅
- Status badges showing ✅
- Criteria visualized ✅

### 6. TEST REPORTS & EXPORTS

**Steps:**
1. Go to **http://localhost:3000/reports**
2. See 3 export options
3. Click **"Download PPTX"**
4. Wait 1-2 seconds
5. File downloads: `Decarb-Strategy-2024-XX-XX.pptx`
6. Open the file:
   - Slide 1: Title
   - Slide 2: Executive Summary
   - Slide 3: Portfolio Overview
   - Slide 4: Emissions Breakdown
   - Slide 5: Scenarios
   - Slide 6: Investment Requirements

**Try Excel:**
1. Click **"Download Excel"**
2. File downloads: `Portfolio-Data-2024-XX-XX.xlsx`
3. Open file - see 5 worksheets:
   - Summary
   - Sites
   - Scenarios
   - Suppliers
   - Emissions Timeline

**Expected Results:**
- PPTX generates successfully ✅
- Excel exports all data ✅
- Files open without errors ✅

### 7. TEST COMMUTING TOOL

**Steps:**
1. Go to **http://localhost:3000/commuting**
2. Select a site from dropdown
3. Enter employee counts by mode:
   - Car: 50 employees, 15 km
   - Bus: 30 employees, 20 km
   - Metro: 20 employees, 25 km
4. See emissions calculate automatically
5. See optimization suggestions

**Expected Results:**
- Emissions calculated ✅
- Mode split displayed ✅
- Recommendations shown ✅

### 8. TEST PRIORITIZATION MATRIX

**Steps:**
1. Go to **http://localhost:3000/prioritization**
2. See 5 interventions plotted on matrix:
   - LED Lighting: Quick Win ✅
   - Solar 500kW: Major Project ✅
   - HVAC VFD: Quick Win ✅
   - Building Envelope: Low Priority
   - Smart BMS: Quick Win ✅
3. Adjust sliders:
   - Move Impact Weight to 70%
   - See table re-sort
4. See quadrant distribution summary

**Expected Results:**
- Matrix displays all points ✅
- Sliders work ✅
- Table sorts by priority ✅

## 🎯 Key Scenarios to Demonstrate

### Scenario A: "Show me 20% reduction"
```
1. Go to /simulator
2. Click "Load Moderate Scenario"
3. Click "Run Simulation"
4. Result: ~20-25% reduction with 3 interventions
```

### Scenario B: "Show me 40% reduction"
```
1. Go to /simulator
2. Click "Load Aggressive Scenario"
3. Click "Run Simulation"
4. Result: ~40-45% reduction with 5 interventions
```

### Scenario C: "Calculate embodied carbon"
```
1. Go to /embodied
2. Click "Load Typical Fit-out"
3. Result: ~120 tCO₂e calculated instantly
4. Adjust materials to see real-time updates
```

## ✅ All Features Working Checklist

- [x] Dashboard with live KPIs
- [x] Portfolio map (interactive)
- [x] Baseline Builder (wizard)
- [x] **SBTi Simulator with 20% & 40% scenarios** ⭐
- [x] **Intervention counter and recommendations** ⭐
- [x] Prioritization Matrix
- [x] Supplier Scorecard
- [x] **Embodied Carbon LCA with quick start** ⭐
- [x] Commuting Tool
- [x] Reports (PPTX + Excel exports)
- [x] Loading states and animations
- [x] Progress bars for targets
- [x] Real-time calculations
- [x] Visual feedback (✓/✗)

## 🚀 Everything is WORKING!

All features are:
- ✅ Functional
- ✅ Interactive
- ✅ Responsive
- ✅ Calculating correctly
- ✅ Visually appealing
- ✅ User-friendly

**Start testing now at http://localhost:3000!** 🎉

