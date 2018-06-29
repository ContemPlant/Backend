const bcrypt = require('bcryptjs')
const lodash = require('lodash')
const utils = require('../../utils')
const { login } = require('../../resolvers/Mutation')({ utils })
const { getUserId } = utils


// Our DB mock
let store = []
const db = {
    mutation: {
        createUser: ({ data }, _) => ({
            token: store.push(data) - 1,
            user: data
        })
    },
    query: {
        user: ({ where }) => lodash.filter(store, where)[0]
    }
}
const mockLogin = args => login(null, args, { db }, null)

// Reset DB before every test
beforeAll(() => store = [])

test('Does not login non existing user', () => {
    return expect(mockLogin({ email: 'ab@c.de', password: 'password123' }))
        .rejects.toThrow('No such user found')
})

test('Invalid password fails', async () => {
    // Create a User
    store.push({
        email: 'ab@c.de',
        password: await bcrypt.hash('password123', 10)
    })
    // Try login
    await expect(mockLogin({ email: 'ab@c.de', password: 'invalid' }))
        .rejects.toThrow('Invalid password')
})

test('Does login existing user', async () => {
    // Create a User
    store.push({
        email: 'ab@c.de',
        password: await bcrypt.hash('password123', 10)
    })
    // Try login
    const { token, user } = await mockLogin({ email: 'ab@c.de', password: 'password123' })
    expect(store[0].email).toEqual('ab@c.de')
    expect(await bcrypt.compare(store[0].password, 'password123')).toBeTruthy
    expect(getUserId({ request: { get: () => token } })).toEqual(user.id)
})