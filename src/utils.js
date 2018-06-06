const jwt = require('jsonwebtoken')
const APP_SECRET = 'sabine123'

/**
 * All mutation resolvers
 * @module Utils
 */

/**
 * Extracts userId from contest
 *
 * @param {Object} context The context object from graphQL
 * @returns userId
 */
function getUserId(context) {
    const Authorization = context.request.get('Authorization')
    // Check if auth headers are set
    if (!Authorization) throw new Error('Not authenticated')

    // extreact userId
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
}

/**
 * Returns the type identifier for given enum string
 * @param {String} enumString String corresponding to an enum
 * @returns type identifier
 */
const matchType = enumString =>
    enumString == 'TEMP'
        ? 'Temperature'
        : enumString == 'RAD'
            ? 'Radiation'
            : enumString == 'HUM'
                ? 'Humidity'
                : enumString == 'LOUD'
                    ? 'Loudness'
                    : null

module.exports = {
    APP_SECRET,
    getUserId,
    matchType
}