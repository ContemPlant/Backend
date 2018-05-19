const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')


/**
 * Creates a new user in the Database.
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function signup(parent, args, context, info) {

    // Hash password
    const password = await bcrypt.hash(args.password, 10)

    // Database insert
    const user = await context.db.mutation.createUser({
        data: { ...args, password }
    }, `{ id }`)

    // generate jwt
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}
/**
 * Logs in an existing User
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function login(parent, args, context, info) {

    // Fetch user from db
    const user = await context.db.query.user({
        where: { email: args.email }
    }, ` { id password } `)
    if (!user) throw new Error('No such user found')

    // Compare password
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) throw new Error('Invalid password')

    // generate jwt
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}
/**
 * Creates a plant for the logged in user (jwt auth)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
function createPlant(parent, args, context, info) {
    return context.db.mutation.createPlant({
        data: {
            ...args,
            owner: { connect: { id: getUserId(context) } }
        }
    }, info)
}
/**
 * Adds a new sensor date for a given plant (identified by arduino id)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function addSensorData(parent, args, context, info) {
    // get the description of matching type
    const sensorTypeDesc = matchType(args.type)
    // which plant
    const plantId = (await context.db.query.ardus({
        where: { id: args.arduId }
    }, `{ loadedPlant { id } }`))[0].loadedPlant.id
    
    return context.db.mutation[`createSensor${sensorTypeDesc}`]({
        data: {
            value: args.value,
            timeStamp: args.timeStamp,
            plant: { connect: { id: plantId } }
        }
    }, info)
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
                : null

module.exports = {
    signup,
    login,
    createPlant,
    addSensorData
}