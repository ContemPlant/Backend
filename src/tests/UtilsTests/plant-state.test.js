const { environment, health, growth } = require('../../utils/plant-state.js')
const lo = require('lodash')

describe('Environment calculation', () => {

    test('Optimal values means optimal environment', () => {
        const optimas = [20, 10, 11, 7]
        const values = optimas
        const weights = [0.25, 0.25, 0.25, 0.25]
        expect(environment(weights, values, optimas)).toBe(1)
    })

    test('Maximum deviation means minmal environment value', () => {
        const optimas = [20, 10, 11, 7]
        const maxDeviations = [10, 20, 100, 100]
        const values = lo.zipWith(optimas, maxDeviations, (a, b) => a + b + 1)
        const weights = [0.25, 0.25, 0.25, 0.25]
        expect(environment(weights, values, optimas, maxDeviations)).toBe(0)
    })
})

describe('Health calculation', () => {

    test('Health improves', () => {
        const oldHealth = 0.6
        const currentEnvironment = 0.8
        expect(health(oldHealth, currentEnvironment)).toBeGreaterThan(oldHealth)
    })

    test('Helath decreases', () => {
        const oldHealth = 0.8
        const currentEnvironment = 0.6
        expect(health(oldHealth, currentEnvironment)).toBeLessThan(oldHealth)
    })
})

describe('Growth calculation', () => {
    test('Env below theshold does not increase growth', () => {
        const oldSize = 512412849128
        const currentHealth = 0.3
        const threshold = 0.5
        expect(growth(oldSize, currentHealth, threshold)).toEqual(oldSize)
    })

    test('Env above theshold does increase growth', () => {
        const oldSize = 20
        const currentHealth = 0.8
        const threshold = 0.5
        expect(growth(oldSize, currentHealth, threshold, 0.5)).toBeGreaterThan(oldSize)
    })
})