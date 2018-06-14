const lo = require('lodash')
const lim = require('./limit.js')({ min: 0 })({ max: 1 })
/**
 * @module Utils
 */

/**
 * Calculates an environment evaluation
 * @param {Array<Float>} values Sensor values
 * @param {Array<Float>} weights Weights for optimas
 * @param {Array<Float>} optimas Optimal sensor value
 * @param {Array<Float>} maxDeviations Max deviation values
 */
function environment(values, weights, optimas, maxDeviations = [10, 20, 100, 100]) {

    const weightSum = lo.sum(weights)

    weights = weights.map(weight => weight / weightSum)
    // Gaussian bell like function
    const fnct = (max) => (deviation) =>
        deviation > max
            ? 0
            : 2 / Math.pow(max, 3) * Math.pow(deviation, 3)
            - (3 / Math.pow(max, 2) * Math.pow(deviation, 2)) + 1

    // Create functions for every max deviation
    const fncts = maxDeviations.map(fnct)

    const combinator = (weight, value, optimum, fn) =>
        weight * fn(Math.abs(optimum - value))

    // Combine all parameters with combinator and sum everything
    return lo.sum(lo.zipWith(weights, values, optimas, fncts, combinator))
}

/**
 * Calculates the new health value for given environment
 * @param {Float} oldHealth 
 * @param {Float} currentEnvironment 
 * @param {Float} factor 
 */
function health(oldHealth, currentEnvironment, factor = 0.5) {
    return lim(oldHealth * factor + currentEnvironment * (1 - factor))
}

/**
 * Calculates the new size for given health
 * @param {Float} oldSize
 * @param {Float} currentHealth 
 * @param {Float} threshold Threshold when to start increasing in size
 * @param {Float} factor 
 */
function plantSize(oldSize, currentHealth, threshold = 0.5, factor = 0.5) {
    return currentHealth > threshold
        ? oldSize + currentHealth * factor
        : oldSize
}


module.exports = {
    environment,
    health,
    plantSize
}