const { loadPlantOnArdu } = require('../../resolvers/Mutation')
const jwt = require('jsonwebtoken')
const { getUserId, APP_SECRET } = require('../../utils')
const lodash = require('lodash')

// *********** Begin mock stuff **************
const store = {
    plantStore: [],
    arduStore: []
}
const resetStore = store => {
    store.plantStore = []
    store.arduStore = []
}
const db = {
    mutation: {
        updateArdu: ({ where, data }, _) => {
            store.arduStore = store.arduStore.map(x =>
                (x.id == where.id)
                    ? { ...x, ...data }
                    : x
            )
            return lodash.filter(store.arduStore, where)[0]
        }
    },
    query: {
        plant: ({ where }, _) => lodash.filter(store.plantStore, where)[0]
    }
}
const mockLoadPlant = context => args => loadPlantOnArdu(null, args, context, null)
// ************ End mock stuff ****************

// Before each test reset the store
beforeEach(() => resetStore(store))

test('Loads plant', async () => {

    // Setup store
    store.plantStore.push({ id: 'plant1', owner: { id: 'user1' } })
    store.arduStore.push({ id: 'ardu1', loadedPlant: null })

    const token = jwt.sign({ userId: 'user1' }, APP_SECRET)

    const ardu = await mockLoadPlant({
        db, request: { get: () => token }
    })({
        plantId: 'plant1',
        arduId: 'ardu1'
    })

    expect(ardu.loadedPlant.connect.id).toEqual('plant1')
})

test('Does not load plant that user doesn`t own', () => {

    // Setup store
    store.plantStore.push({ id: 'plant1', owner: { id: 'user1' } })
    store.arduStore.push({ id: 'ardu1', loadedPlant: null })

    const token = jwt.sign({ userId: 'user2' }, APP_SECRET)
    const arduPromise = mockLoadPlant({
        db, request: { get: () => token }
    })({
        plantId: 'plant1',
        arduId: 'ardu1'
    })
    expect(arduPromise).rejects.toThrowError("Client does not have permisson to load plant")
})

