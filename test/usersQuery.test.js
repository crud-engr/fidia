const User = require('../models/User');
const { resolvers } = require('../schema/Resolvers');
const { typeDefs } = require('../schema/TypeDefs');

describe('USERS QUERY', () => {
    describe('ALL USERS', () => {
        test('should list all registered users', async () => {
            const users = await resolvers.Query.getAllUsers();
            console.log(users);
            // expect(users).toBe([]);
        });
    });
});
