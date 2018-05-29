const jwt = require('jsonwebtoken')
const APP_SECRET = 'sabine123'

function getUserId(context) {
    const Authorization = context.request.get('Authorization')
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, APP_SECRET)
        return userId
    }

    throw new Error('Not authenticated')
}

/**
 * Returns the type identifier for given enum string
 * @param {String} enumString String corresponding to an enum
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