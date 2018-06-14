const { newSensorDates } = require('../../resolvers/Subscription')({  utils: require('../../utils') })


// Our DB mock
const db = {
    subscription: { sensorDates: jest.fn() }
}

test('Calls database subscription correctly', async () => {
    const args = { plantId: 'power-plant', type: 'TEMP' }

    db.subscription.sensorDates.mockResolvedValue(true)

    await expect(newSensorDates.subscribe(null, args, { db }, null)).resolves.toBe(true)

    expect(db.subscription.sensorDates.mock.calls[0][0]).toEqual({
        where: { mutation_in: ['CREATED'], node: { plant: { id: 'power-plant' } } }
    })
});