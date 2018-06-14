/**
 * @module Utils
 */

/**
 * Limits a value to min and max
 */
const limit = ({ min }) => ({ max }) => (value) =>
    (value > max)
        ? max
        : (value < min)
            ? min
            : value

module.exports = limit
