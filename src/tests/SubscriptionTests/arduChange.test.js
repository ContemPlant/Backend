const { arduChange } = require('../../resolvers/Subscription')

// Our DB mock
const db = {
    subscription: { ardu: jest.fn() }
}


test('Call subscribe function on ardu table', async () => {
    const args = {
        where: { mutation_in: ['UPDATED'] }
    }
    const info = "XXX"
    db.subscription.ardu.mockResolvedValue(true)
    await expect(arduChange.subscribe(null, args, { db }, info)).resolves.toBe(true)

    expect(db.subscription.ardu).toBeCalledWith({ ...args }, info)
})