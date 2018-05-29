const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

function temperature_data(parent, args, context, info) {
    return context.db.subscription.sensorTemperature(
        { where: { mutation_in: ['CREATED'] } },
        info,
    )
}

function arduSubscribe(parent, args, context, info) {
    return context.db.subscription.ardu(
        { where: args.where },
        info,
    )
}


const newTempData = {
    subscribe: temperature_data
}

const arduChange = {
    subscribe: arduSubscribe
}

module.exports = {
    newTempData,
    arduChange
}