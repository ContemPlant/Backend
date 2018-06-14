const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, plantState } = require('../utils')

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
function createPlant(parent, { input }, context, info) {
    return context.db.mutation.createPlant({
        data: {
            ...input,
            owner: { connect: { id: getUserId(context) } }
        }
    }, info)
}
/**
 * returns true if the plant with the given plantID is allowed to be edited from the given context
 * @param {Object} context context in which plant editing permission are checked...
 * @param {Object} plantID the id of the plant 
 */
async function hasPlantEditPermissionInContext(context, plantID) {
    const plantOwnerID = (await context.db.query.plant({
        where: { id: plantID }
    }, `{ owner { id } }`)).owner.id

    if (plantOwnerID != getUserId(context))
        return false
    
    return true
}
/**
 * Returns the ardu which has loaded the plant with the given ID
 * @param {Object} context the context
 * @param {Object} plantID the plant id
 */
async function arduPlantIsLoadedToInContext(context, plantID) {
    return (await context.db.query.ardus({ where: { loadedPlant: { id: plantID } } }) )[0]
}

/**
 * Basically links an ardu to a plant (loading it)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function loadPlantOnArdu(parent, args, context, info) {
    if (!(await hasPlantEditPermissionInContext(context, args.plantId)))
        throw new Error("Client does not have permisson to load plant")


    // check that plantID isn't already loaded to another ardu
    const arduPlantIsLoadedTo = await arduPlantIsLoadedToInContext(context, args.plantId)
    if (arduPlantIsLoadedTo)
        throw new Error("Plant is already loaded to another ardu!")


    return context.db.mutation.updateArdu({
        where: { arduId: args.arduId, },
        data: { loadedPlant: { connect: { id: args.plantId } } }
    }, info)
}

async function loadedPlantOnArduWithID(arduID, context) {
    return (await context.db.query.ardus( { where: { arduId: arduID} }, "{loadedPlant { id }}" ))[0].loadedPlant
}

/**
 * Basically unloads a plant from an ardu in the database by unlinking the plant from the ardu
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function unloadPlantFromArdu(parent, args, context, info) {
    //get the plant loaded to the ardu
    const loadedPlant = await loadedPlantOnArduWithID(args.arduId, context)

    if (!loadedPlant)
        throw new Error("No plant is loaded to the given ardu... Sorry!")

    if (!(await hasPlantEditPermissionInContext(context, loadedPlant.id)))
        throw new Error("Client does not have permission to unload plant")

    //unload the loaded plant
    return context.db.mutation.updateArdu({
        data: {
            loadedPlant: {
                disconnect: true
            }
        },
        where: {
            arduId: args.arduId
        }
    })
}
/**
 * Unloads a plant with a given ID
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function unloadPlant(parent, args, context, info) {
    const arduPlantIsLoadedTo = await arduPlantIsLoadedToInContext(context, args.plantId)

    if (!arduPlantIsLoadedTo)
        throw new Error("The plant cannot be unloaded, because it wasn't loaded previously!")

    return unloadPlantFromArdu(parent, {arduId: arduPlantIsLoadedTo.arduId}, context, info)
}

/**
 * Adds a new sensor dates for a given plant (identified by arduino id)
 * @param {Object} parent Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
async function addSensorDates(parent, args, context, info) {
    //seperate arduId from input data
    const { arduId, ...sensorValues } = args.input

    // which plant
    const plant = (await context.db.query.ardu({
        where: { arduId }
    }, `{ 
        loadedPlant { 
            id
            temperature_opt
            temperature_weight
            radiation_opt
            radiation_weight
            humidity_opt
            humidity_weight
            loudness_opt
            loudness_weight 
            plantStates(last: 1) { health size } 
        } 
        
    }`)).loadedPlant

    // Prepare data for insertion into sensorDates table
    const data = { ...sensorValues, plant: { connect: { id: plant.id } } }

    // create sensor dates
    const sensorDates = await context.db.mutation.createSensorDates({ data }, `{ id }`)

    // Destructure old health and size from last state or use 0 as initial value
    const { health: oldHealth, size: oldSize } = plant.plantStates[0] || { health: 0, size: 0 }

    // Get the current values from input
    const { temperatureValue, humidityValue, radiationValue, loudnessValue } = sensorValues

    // Get weights and optimas from plant
    const {
        temperature_weight, radiation_weight, humidity_weight, loudness_weight,
        temperature_opt, radiation_opt, humidity_opt, loudness_opt
    } = plant

    // Pack into arrays
    const values = [temperatureValue, humidityValue, radiationValue, loudnessValue],
        weights = [temperature_weight, radiation_weight, humidity_weight, loudness_weight],
        optimas = [temperature_opt, radiation_opt, humidity_opt, loudness_opt]

    // Calculate new state
    const environment = plantState.environment(values, weights, optimas)
    const health = plantState.health(oldHealth, environment)
    const size = plantState.plantSize(oldSize, health)
    const newState = { environment, health, size }
    // Insert new state
    await context.db.mutation.createPlantState({
        data: {
            ...newState,
            sensorDates: { connect: { id: sensorDates.id } },
            plant: { connect: { id: plant.id } }
        }
    })

    // Return sensorDates
    return context.db.query.sensorDates({ where: { id: sensorDates.id } }, info)
}

module.exports = {
    signup,
    login,
    createPlant,
    addSensorDates,
    loadPlantOnArdu,
    unloadPlantFromArdu,
    unloadPlant
}