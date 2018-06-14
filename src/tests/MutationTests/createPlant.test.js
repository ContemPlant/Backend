const utils = require('../../utils')
const { createPlant } = require('../../resolvers/Mutation')({ utils })
const jwt = require('jsonwebtoken')

const { APP_SECRET } = utils

const store = []
const db = {
    mutation: {
        createPlant: ({ data }, _) => {
            store.push(data)
            return data
        }
    }
}
const mockCreatePlant = context => args => createPlant(null, args, context, null)

test('Inserts new plant correctly', async () => {

    const token = jwt.sign({ userId: 0 }, APP_SECRET)
    const mockCreatePlantWithCTX = mockCreatePlant({ db, request: { get: () => token } })
    const input = {
        temperature_opt: 10,
        temperature_weight: 1
    }
    const plant = await mockCreatePlantWithCTX({ input })
    expect(plant.temperature_opt).toEqual(10)
    expect(plant.temperature_weight).toEqual(1)
    expect(plant.owner.connect.id).toEqual(0)
    expect(store[0]).toEqual(plant)
})