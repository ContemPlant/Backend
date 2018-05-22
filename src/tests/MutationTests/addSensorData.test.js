const { addSensorData } = require('../../resolvers/Mutation')
const lodash = require('lodash')

//context.db.query.ardus

const store = {
    ardus: [],
    sensors: [],
    plants: []
}
const db = {
    mutation: {
        createSensor: (type) => ({ data }, _) => {
            store.sensors.push({ ...data, type })
            return data
        },
        createSensorTemperature: (x, y) => db.mutation.createSensor('TEMP')(x, y),
        createSensorHumidity: (x, y) => db.mutation.createSensor('HUM')(x, y),
        createSensorRadiation: (x, y) => db.mutation.createSensor('RAD')(x, y)
    },
    query: {
        ardu: ({ where }, _) => lodash.filter(store.ardus, where)[0],
        plant: ({ where }, _) => lodash.filter(store.plants, where)[0]
    }
}

test('adds sensor dates', async () => {
    // Setup db
    store.ardus.push({ id: 'ardu1', loadedPlant: { id: 'plant1' } })
    store.plants.push({ id: 'plant1' })

    // for every type of sensor
    for (const sensorType of ['TEMP', 'HUM', 'RAD']) {

        const args = { arduId: 'ardu1', type: sensorType, value: 10.0, timeStamp: 'now' }
        // Destructure the args to only get sensordate properties
        const { arduId, ...sensorDate } = args

        const plant = await addSensorData(null, args, { db }, null)

        // Store now contains the sensorDate and is also connected to a plant
        expect(store.sensors[0]).toEqual({ ...sensorDate, plant: { connect: { id: 'plant1' } } })
        expect(plant).toEqual(store.plants[0])

        // reset store
        store.sensors = []
    }

})