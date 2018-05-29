const { newSensorData } = require('../../resolvers/Subscription')

// Our DB mock
const db = {
    subscription: { sensorTemperature: jest.fn() }
}

test('Calls database subscription correctly', async () => {
    const args = { plantId: 'power-plant', type: 'TEMP' }

    db.subscription.sensorTemperature.mockResolvedValue(true)

    await expect(newSensorData.subscribe(null, args, { db }, null)).resolves.toBe(true)

    expect(db.subscription.sensorTemperature.mock.calls[0][0]).toEqual({
        where: { mutation_in: ['CREATED'], node: { plant: { id: 'power-plant' } } }
    })
});