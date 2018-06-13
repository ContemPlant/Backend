const lo = require('lodash')
const lim = require('./limit.js')({ min: 0 })({ max: 1 })
/**
 * @module Utils
 */

function environment(weights, values, optimas, maxDeviations = [10, 20, 100, 100]) {

    const fnct = (max) => (deviation) =>
        deviation > max
            ? 0
            : 2 / Math.pow(max, 3) * Math.pow(deviation, 3)
            - (3 / Math.pow(max, 2) * Math.pow(deviation, 2)) + 1

    const fncts = maxDeviations.map(fnct)

    const combinator = (weight, value, optimum, fn) =>
        weight * fn(Math.abs(optimum - value))

    return lo.sum(lo.zipWith(weights, values, optimas, fncts, combinator))
}

function health(oldHealth, currentEnvironment, factor = 0.5) {
    return lim(oldHealth * factor + currentEnvironment * (1 - factor))
}

function growth(oldSize, currentHealth, threshold = 0.5, factor = 0.5) {
    return currentHealth > threshold
        ? oldSize + currentHealth * factor
        : oldSize
}


module.exports = {
    environment,
    health,
    growth
}