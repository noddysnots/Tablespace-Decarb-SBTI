import {
  calculateElectricityEmissions,
  calculateFuelEmissions,
  calculateRefrigerantEmissions,
} from '@/lib/calculations/emissions'

describe('Emission Calculations', () => {
  test('calculateElectricityEmissions', () => {
    const kWh = 10000
    const emissionFactor = 0.82 // kgCO2e/kWh
    const result = calculateElectricityEmissions(kWh, emissionFactor)
    expect(result).toBe(8200)
  })

  test('calculateFuelEmissions', () => {
    const liters = 1000
    const density = 0.832 // kg/liter
    const emissionFactor = 2.68 // kgCO2e/kg
    const result = calculateFuelEmissions(liters, density, emissionFactor)
    expect(result).toBeCloseTo(2229.76)
  })

  test('calculateRefrigerantEmissions', () => {
    const kg = 10
    const gwp = 2088
    const leakage = 10 // percent
    const result = calculateRefrigerantEmissions(kg, gwp, leakage)
    expect(result).toBe(2088)
  })
})

