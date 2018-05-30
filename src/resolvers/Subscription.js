const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, matchType } = require('../utils')

/**
 * Subscription on a table of sensorData<type>
 */
function newSensorData(parent, args, context, info) {
    return context.db.subscription['sensor' + matchType(args.type)]({
        where: {
            mutation_in: ['CREATED'],
            node: { plant: { id: args.plantId } }
        }
    }, `{ node { value, timeStamp } }`)
}
/**
 * Subscription on the ardu table
 */
function arduChange(parent, args, context, info) {
    return context.db.subscription.ardu({
        where: args.where
    }, info)
}

/**
 * Resolves the sensordata changes to a SensorSubscriptionPayload
 */
function resolveNewSensorData(parent, args, context, info) {
    const description = `sensor${matchType(args.type)}`
    const values = parent[description].node
    return {
        type: args.type,
        ...values
    }
}

module.exports = {
    arduChange: { subscribe: arduChange },
    newSensorData: {
        subscribe: newSensorData,
        resolve: resolveNewSensorData
    }
}
