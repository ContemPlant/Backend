const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

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

function createPlant(parent, args, context, info) {
    return context.db.mutation.createPlant({
        data: {
            ...args,
            owner: { connect: { id: getUserId(context) } }
        }
    }, info)
}

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

const matchType = typeEnum =>
    typeEnum == 'TEMP'
        ? 'Temperature'
        : typeEnum == 'RAD'
            ? 'Radiation'
            : typeEnum == 'HUM'
                ? 'Humidity'
                : typeEnum == 'WAT'
                    ? 'Water'
                    : null

module.exports = {
    signup,
    login,
    createPlant,
    addSensorData
}