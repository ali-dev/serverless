const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull: NonNull
} = require('graphql')

const { expect } = require('chai')

const BigInt = require('./index')

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    inc: {
      type: new NonNull(BigInt),
      args: {
        num: { type: new NonNull(BigInt) }
      },
      resolve: (root, args) => args.num + 1
    },
    emptyErr: {
      type: new NonNull(BigInt),
      resolve: () => ''
    },
    typeErr: {
      type: new NonNull(BigInt),
      resolve: () => 3.14
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    inc: {
      type: new NonNull(new GraphQLObjectType({
        name: 'IncPayload',
        fields: {
          result: { type: new NonNull(BigInt) }
        }
      })),
      args: {
        input: {
          type: new NonNull(new GraphQLInputObjectType({
            name: 'IncInput',
            fields: {
              num: { type: new NonNull(BigInt) }
            }
          }))
        }
      },
      resolve: (root, args) => ({ result: args.input.num + 1 })
    }
  }
})

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
})

const validQuery = `{
  a: inc(num: 1)
  b: inc(num: 2147483646)
  c: inc(num: 2147483647)
  d: inc(num: 2147483648)
  e: inc(num: 439857257821345)
  f: inc(num: ${Number.MAX_SAFE_INTEGER - 1})
}`

const invalidQuery1 = `{
  h: inc(num: ${Number.MAX_SAFE_INTEGER + 1})
  i: inc(num: "1")
  j: inc(num: "")
}`

const invalidQuery2 = `{
  g: inc(num: ${Number.MAX_SAFE_INTEGER})
}`

const invalidQuery3 = `{
  k: emptyErr
}`

const invalidQuery4 = `{
  k: typeErr
}`

const validMutation = `mutation test(
  $input1: IncInput!,
  $input2: IncInput!,
  $input4: IncInput!
) {
  a: inc(input: $input1) { result }
  b: inc(input: $input2) { result }
  d: inc(input: $input4) { result }
}`

const validVariables = {
  input1: { num: 2147483646 },
  input2: { num: Number.MAX_SAFE_INTEGER - 1 },
  input4: { num: '1' }
}

const invalidMutation = `mutation test(
  $input3: IncInput!,
) {
  c: inc(input: $input3) { result }
}`

const invalidVariables = {
  input3: { num: Number.MAX_SAFE_INTEGER + 1 }
}

graphql(schema, invalidQuery1)
  .then(({ data, errors }) => {
    expect(errors).to.have.lengthOf(3)
    expect(errors[0].message).to.equal('Argument "num" has invalid value 9007199254740992.\nExpected type "BigInt", found 9007199254740992.')
    expect(errors[1].message).to.equal('Argument "num" has invalid value "1".\nExpected type "BigInt", found "1".')
    expect(errors[2].message).to.equal('Argument "num" has invalid value "".\nExpected type "BigInt", found "".')
    expect(data).to.equal(undefined)
    return graphql(schema, invalidQuery2)
  })
  .then(({ data, errors }) => {
    expect(errors).to.have.lengthOf(1)
    expect(errors[0].message).to.equal('BigInt cannot represent non 53-bit signed integer value: 9007199254740992')
    expect(data).to.equal(null)
    return graphql(schema, invalidQuery3)
  })
  .then(({ data, errors }) => {
    expect(errors).to.have.lengthOf(1)
    expect(errors[0].message).to.equal('BigInt cannot represent non 53-bit signed integer value: (empty string)')
    expect(data).to.equal(null)
    return graphql(schema, invalidQuery4)
  })
  .then(({ data, errors }) => {
    expect(errors).to.have.lengthOf(1)
    expect(errors[0].message).to.equal('BigInt cannot represent non 53-bit signed integer value: 3.14')
    expect(data).to.equal(null)
    return graphql(schema, validQuery)
  })
  .then(({ data, errors }) => {
    expect(errors).to.equal(undefined)
    expect(data).to.deep.equal({
      a: 2,
      b: 2147483647,
      c: 2147483648,
      d: 2147483649,
      e: 439857257821346,
      f: 9007199254740991
    })
    return graphql(schema, invalidMutation, null, null, invalidVariables)
  })
  .then(({ data, errors }) => {
    expect(errors).to.have.lengthOf(1)
    expect(errors[0].message).to.equal('Variable "$input3" got invalid value {"num":9007199254740992}.\nIn field "num": Expected type "BigInt", found 9007199254740992: BigInt cannot represent non 53-bit signed integer value: 9007199254740992')
    expect(data).to.equal(undefined)
    return graphql(schema, validMutation, null, null, validVariables)
  })
  .then(({ data, errors }) => {
    expect(errors).to.equal(undefined)
    expect(data).to.deep.equal({
      a: { result: 2147483647 },
      b: { result: 9007199254740991 },
      d: { result: 2 }
    })
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

