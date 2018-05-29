const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, matchType } = require('../utils')

async function *sensorsData(parent, args, context, info) {

    const sensorData = await context.db.subscription['sensor' + matchType(args.type)](
        { where: args.where, plant: { id: args.plantId } },
        info,
    )

    console.log(sensorData)
}

function arduSubscribe(parent, args, context, info) {
    return context.db.subscription.ardu(
        { where: args.where },
        info,
    )
}

const newSensorData = {
    subscribe: sensorsData
}

const arduChange = {
    subscribe: arduSubscribe
}

module.exports = {
    newSensorData,
    arduChange
}