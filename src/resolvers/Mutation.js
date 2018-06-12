const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, matchType } = require('../utils')

/**
 * All mutation resolvers
 * @module Mutation
 */
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
 * Basically links an ardu to a plant (loading it)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function loadPlantOnArdu(parent, args, context, info) {
    const userId = (await context.db.query.plant({
        where: { id: args.plantId }
    }, `{ owner { id } }`)).owner.id

    if (userId != getUserId(context))
        throw new Error("Client does not have permisson to load plant")

        
    // check that plantID isn't already loaded to another ardu
    let ardusPlantIsLoadedTo = await context.db.query.ardus({ where: { loadedPlant: { id: args.plantId } } })
    if (ardusPlantIsLoadedTo.length > 0)
        throw new Error("Plant is already loaded to another ardu!")


    return context.db.mutation.updateArdu({
        where: { arduId: args.arduId, },
        data: { loadedPlant: { connect: { id: args.plantId } } }
    }, info)
}

/**
 * Adds a new sensor dates for a given plant (identified by arduino id)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function addSensorDates(parent, args, context, info) {
    // seperate arduId from input data
    const { arduId, ...input } = args

    // which plant
    const plantId = (await context.db.query.ardu({
        where: { arduId: arduId }
    }, `{ loadedPlant { id } }`)).loadedPlant.id

    // Add sensor dates
    return context.db.mutation.createSensorDates({
        data: {
            ...input,
            plant: { connect: { id: plantId } }
        }
    }, info)
}

module.exports = {
    signup,
    login,
    createPlant,
    addSensorDates,
    loadPlantOnArdu
}