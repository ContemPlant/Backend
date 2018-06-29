const utils = require('../../utils')
const Mutations = require('../../resolvers/Mutation')

const db = {
    mutation: { createPlant: jest.fn().mockReturnValue(true) }
}

test('Inserts new plant correctly', async () => {
    const mockUtils = {
        ...utils,
        getUserId: () => 'user1'
    }

    const { createPlant: mockCreatePlant } = Mutations({ utils: mockUtils })

    const input = {
        temperature_opt: 10,
        temperature_weight: 1
    }
    const plant =  mockCreatePlant(null, { input }, { db })
    await expect(plant).toEqual(true)

    expect(db.mutation.createPlant.mock.calls[0][0]).toEqual({
        data: {
            owner: { connect: { id: "user1" } },
            temperature_opt: 10,
            temperature_weight: 1
        }
    })
})