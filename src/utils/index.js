
const APP_SECRET = 'sabine123'
const getUserId = require('./get-user-id.js')({ APP_SECRET })
const plantState = require('./plant-state.js')
const databaseShorthands = require('./database-shorthands')({ getUserId })

/**
 * @module Utils
 */

module.exports = {
    APP_SECRET,
    getUserId,
    plantState,
    ...databaseShorthands
}