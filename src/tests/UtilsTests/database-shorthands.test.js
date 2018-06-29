const shorthands = require('../../utils/database-shorthands')

const db = {
    query: {
        plant: jest.fn().mockReturnValue({ owner: { id: 'user1' } })
    }
}
describe('hasPlantEditPermissionInContext', () => {

    test('User with permission is allowed', async () => {
        const getUserId = () => 'user1'
        const { hasPlantEditPermissionInContext: hasPermission } = shorthands({ getUserId })
        const allowed = hasPermission({ db }, 'plantId')

        await expect(allowed).resolves.toBe(true)
        expect(db.query.plant.mock.calls[0][0]).toEqual({ where: { id: 'plantId' } })
    })

    test('User without permission is denied', async () => {
        const getUserId = () => 'user2'
        const { hasPlantEditPermissionInContext: hasPermission } = shorthands({ getUserId })
        const allowed = hasPermission({ db }, 'plantId')

        await expect(allowed).resolves.toBe(false)
    })
})