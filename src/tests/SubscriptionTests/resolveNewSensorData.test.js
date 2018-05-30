const { newSensorData } = require('../../resolvers/Subscription')


test('resolves by adding the type', () => {
    const parent = {
        sensorTemperature: { node: { value: 10, timeStamp: 'Yesterday' } }
    }
    const args = { type: 'TEMP' }
    expect(newSensorData.resolve(parent, args, null, null)).toEqual({
        value: 10,
        timeStamp: 'Yesterday',
        type: 'TEMP'
    })

});