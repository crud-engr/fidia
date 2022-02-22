const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: String!
        name: String!
        email: String!
        mobileNumber: String!
        country: String!
        isVerified: Boolean!
        accessToken: String!
    }

    ### Queries
    type Query {
        getAllUsers: [User!]!
    }

    ### Mutations
    type Mutation {
        signup(
            name: String!
            email: String!
            mobileNumber: String!
            country: String!
            password: String!
        ): String!

        login(email: String!, password: String!): String!

        verifyEmail(_id: String!): String!

        resendToken(_id: String!): String!

        # resendVerificationEmail: User!
    }
`;

module.exports = { typeDefs };
