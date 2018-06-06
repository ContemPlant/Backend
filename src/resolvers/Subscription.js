const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, matchType } = require('../utils')
/**
 * All subscription resolvers
 * @module Subscription
 */

/**
 * Subscription on a table of sensorData<type>
 *
 * @param {Object} root Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 * @returns subscription iterator
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
 *
 * @param {Object} root Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 * @returns subscription iterator
 */
function arduChange(parent, args, context, info) {
    return context.db.subscription.ardu({
        where: args.where
    }, info)
}

/**
 * Resolves the sensordata changes to a SensorSubscriptionPayload
 *
 * @param {Object} root Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 * @returns SensorSubscriptionPayload
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
