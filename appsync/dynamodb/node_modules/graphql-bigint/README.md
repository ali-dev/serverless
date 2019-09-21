graphql-bigint
=============

A wider integer type for [graphql-js](https://github.com/graphql/graphql-js) than the default 32-bit `GraphQLInt`. This implementation gives you 53-bit integers.

## The problem

The GraphQL spec limits its `Int` type to 32-bits. Maybe you've seen this error before:

```
GraphQLError: Argument "num" has invalid value 9007199254740990.
              Expected type "Int", found 9007199254740990.
```

Why? 64-bits would be too large for JavaScript's 53-bit limit. According to Lee Byron, a 52-bit integer spec would have been "too weird" [see this issue](https://github.com/graphql/graphql-js/issues/292).

## Usage

```shell
$ npm install graphql-bigint
```

Use it the same as any other scalar type, either input or output.

```js
const BigInt = require('graphql-bigint')

const SomeType = new GraphQLObjectType({
  name: 'SomeType',
  fields: {
    numberField: {
      type: BigInt,
      // this would throw an error with the GraphQLInt
      resolve: () => Number.MAX_SAFE_INTEGER 
    }
  }
})
```

