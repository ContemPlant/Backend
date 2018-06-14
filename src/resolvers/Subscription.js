const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
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
function newSensorDates(parent, args, context, info) {
    return context.db.subscription.sensorDates({
        where: {
            mutation_in: ['CREATED'],
            node: { plant: { id: args.plantId } }
        }
    }, info)
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

module.exports = {
    arduChange: { subscribe: arduChange },
    newSensorDates: { subscribe: newSensorDates }
}
