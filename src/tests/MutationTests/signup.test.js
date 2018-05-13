const { signup } = require('../../resolvers/Mutation')
const { getUserId } = require('../../utils')
const bcrypt = require('bcryptjs')

const store = []
const db = {
    mutation: {
        createUser: ({ data }, _) => ({
            token: store.push(data) - 1,
            user: data
        })
    }
}
const mockSignup = args => signup(null, args, { db }, null)

test('Inserts new user correctly', async () => {
    const { token, user } = await mockSignup({ email: 'ab@c.de', password: 'password123' })
    expect(store[0].email).toEqual('ab@c.de')
    expect(await bcrypt.compare(store[0].password, 'password123')).toBeTruthy
    expect(getUserId({ request: { get: () => token } })).toEqual(user.id)
})