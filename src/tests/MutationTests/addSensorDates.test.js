const { addSensorDates } = require('../../resolvers/Mutation')({ utils: require('../../utils') })
const lodash = require('lodash')

const store = {
    ardus: [],
    sensors: [],
    plants: [],
    states: []
}
const db = {
    mutation: {
        createSensorDates: ({ data }, _) => {
            const insert = { ...data, id: store.size }
            store.sensors.push(insert)
            return insert
        },
        createPlantState: ({ data }, _) => {
            store.states.push({ ...data })
            return data
        }
    },
    query: {
        ardu: ({ where }, _) => lodash.filter(store.ardus, where)[0],
        plant: ({ where }, _) => lodash.filter(store.plants, where)[0],
        sensorDates: ({ where }, _) => lodash.filter(store.sensors, where)[0]
    }
}

test('adds sensor dates and generates state', async () => {
    // Setup db
    const plantConfig = {
        temperature_opt: 10,
        temperature_weight: 1,
        humidity_opt: 10,
        humidity_weight: 1,
        radiation_opt: 1337,
        radiation_weight: 1,
        loudness_opt: 200,
        loudness_weight: 1
    }
    store.ardus.push({ arduId: 'ardu1', loadedPlant: { id: 'plant1', plantStates: [], ...plantConfig } })
    store.plants.push({ id: 'plant1' })

    const input = {
        arduId: 'ardu1',
        timeStamp: 'now',
        temperatureValue: 10,
        humidityValue: 10,
        radiationValue: 20,
        loudnessValue: 1337
    }
    // Destructure the args to only get sensordate properties

    const sensorDates = await addSensorDates(null, { input }, { db }, null)
    // Store now contains the sensorDate and is also connected to a plant

    expect(store.sensors[0]).toEqual({ ...sensorDates, plant: { connect: { id: 'plant1' } } })
    expect(store.states[0].size).toBe(0)
    expect(store.states[0].sensorDates).toEqual({ connect: { id: store.sensors[0].id } })
    expect(store.states[0].plant).toEqual({ connect: { id: 'plant1' } })

})