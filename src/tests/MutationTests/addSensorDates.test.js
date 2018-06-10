const { addSensorDates } = require('../../resolvers/Mutation')
const lodash = require('lodash')

const store = {
    ardus: [],
    sensors: [],
    plants: []
}
const db = {
    mutation: {
        createSensorDates: ({ data }, _) => {
            store.sensors.push({ ...data })
            return data
        }
    },
    query: {
        ardu: ({ where }, _) => lodash.filter(store.ardus, where)[0],
        plant: ({ where }, _) => lodash.filter(store.plants, where)[0]
    }
}

test('adds sensor dates', async () => {
    // Setup db
    store.ardus.push({ arduId: 'ardu1', loadedPlant: { id: 'plant1' } })
    store.plants.push({ id: 'plant1' })

    const args = {
        arduId: 'ardu1',
        timeStamp: 'now',
        temperatureValue: 10,
        humidityValue: 10,
        radiationValue: 20,
        loudnessValue: 1337
    }
    // Destructure the args to only get sensordate properties
    const { arduId, ...sensorDate } = args

    const sensorDates = await addSensorDates(null, args, {db}, null)
    // Store now contains the sensorDate and is also connected to a plant
    expect(store.sensors[0]).toEqual({ ...sensorDate, plant: { connect: { id: 'plant1' } } })

})