const utils = require('../../utils')
const Mutations = require('../../resolvers/Mutation')

const db = {
    mutation: {
        updateArdu: jest.fn()
    }
}

test('Loads plant (client has permission, non loaded plant)', async () => {

    const mockUtils = {
        ...utils,
        getUserId: () => 'user1',
        hasPlantEditPermissionInContext: () => true,
        arduPlantIsLoadedToInContext: () => null
    }

    const { loadPlantOnArdu: mockLoadPlant } = Mutations({ utils: mockUtils })

    const args = { plantId: 'plant1', arduId: 'ardu1' }
    const ardu = await mockLoadPlant(null, args, { db })

    expect(db.mutation.updateArdu.mock.calls[0][0]).toEqual({
        data: { loadedPlant: { connect: { id: "plant1" } } },
        where: { arduId: "ardu1" }
    })
})

test('Does not load plant (client has no permission)', () => {

    const mockUtils = {
        ...utils,
        getUserId: () => 'user1',
        hasPlantEditPermissionInContext: () => false,
        arduPlantIsLoadedToInContext: () => null
    }

    const { loadPlantOnArdu: mockLoadPlant } = Mutations({ utils: mockUtils })
    const args = { plantId: 'plant1', arduId: 'ardu1' }
    const arduPromise = mockLoadPlant(null, args, { db })

    expect(arduPromise).rejects.toThrowError('Client does not have permisson to load plant')
})

test('Does not load plant (Plant already loaded)', () => {

    const mockUtils = {
        ...utils,
        getUserId: () => 'user1',
        hasPlantEditPermissionInContext: () => true,
        arduPlantIsLoadedToInContext: () => 'notNull'
    }

    const { loadPlantOnArdu: mockLoadPlant } = Mutations({ utils: mockUtils })
    const args = { plantId: 'plant1', arduId: 'ardu1' }
    const arduPromise = mockLoadPlant(null, args, { db })

    expect(arduPromise).rejects.toThrowError('Plant is already loaded to another ardu!')
})

