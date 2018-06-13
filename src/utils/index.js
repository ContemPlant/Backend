const APP_SECRET = 'sabine123'

/**
 * @module Utils
 */


module.exports = {
    APP_SECRET,
    getUserId: require('./get-user-id.js')({ APP_SECRET })
}