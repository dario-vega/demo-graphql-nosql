// graphql_oracle_nosql.js
// You need create the following table described in ddl.sql

const express = require('express');
const graphql = require('express-graphql');
const graphqlTools = require('graphql-tools');
const NoSQLClient = require('oracle-nosqldb').NoSQLClient;
const Region = require('oracle-nosqldb').Region;
const ServiceType = require('oracle-nosqldb').ServiceType;
const app = express();

let port = process.env.PORT || 3000;

// Sample Data
const TABLE_NAME = 'blogtable';
const blogsData = [{id: 1, blog: 'Hello World by Dario'}];

process
.on('SIGTERM', function() {
  console.log("\nTerminating");
  if (client) {
     console.log("\close client SIGTERM");
     client.close();
  }
  process.exit(0);
})
.on('SIGINT', function() {
  console.log("\nTerminating");
  if (client) {
     console.log("\close client SIGINT");
     client.close();
  }
  process.exit(0);
});


//
// NoSQL Access Helpers
//

async function getAllBlogsHelper() {
  let statement = `SELECT * FROM ${TABLE_NAME} LIMIT 100`;
  const rows = [];
  let cnt ;
  let res;
  do {
     res = await client.query(statement, { continuationKey:cnt});
     rows.push.apply(rows, res.rows);
     cnt = res.continuationKey;
  } while(res.continuationKey != null);
  return rows;
}

async function getOneBlogHelper(id) {
  res = await client.get(TABLE_NAME, { id: id });
  return res.row;
}

async function createBlogHelper(input) {
  res = await client.putIfAbsent(TABLE_NAME, {
        blog: input.blog
  });
  let newBlog = {id :res.generatedValue , blog: input.blog};
  return newBlog;
}

async function updateBlogHelper(id, input) {
  // Because we are using GENERATED ALWAYS AS IDENTITY I am using UPDATE command 
  // We can use the command putIfPresent in other cases - see updateBlogHelperWithoutSeq
  //  https://docs.oracle.com/en/database/other-databases/nosql-database/19.5/java-driver-table/inserting-identity-values-programmatically.html
  statement = `DECLARE $v_blog STRING; $v_id INTEGER; UPDATE ${TABLE_NAME} SET blog = $v_blog WHERE id=$v_id`;
  const preparedStmt = await client.prepare(statement);
  preparedStmt.bindings = {
    $v_id: id,
    $v_blog : input.blog
  };
  res = await client.query(preparedStmt);
  let updBlog = {id : id , blog: input.blog};
  return updBlog;
}

async function updateBlogHelperWithoutSeq(id, input) {
  res = await client.putIfPresent(TABLE_NAME, {
        id: id,
        blog: input.blog
  });
  let updBlog = {id : id , blog: input.blog};
  return updBlog;
}

async function deleteBlogHelper(id) {
  res = await client.delete(TABLE_NAME, {
        id: id
  });
  delBlog = {id: id, blog : 'Deleted'};
  return delBlog;
}

// Simple Blog schema with ID, blog fields
const typeDefs = `
type Blog {
  id: Int!,
  blog: String!
}
type Query {
  blogs: [Blog],
  blog(id: Int): Blog
}
input BlogEntry {
  blog: String!,
}
type Mutation {
  createBlog(input: BlogEntry): Blog!,
  updateBlog(id: Int, input: BlogEntry): Blog!,
  deleteBlog(id: Int): Blog!
}`;



// Resolver to match the GraphQL query and return data
const resolvers = {
  Query: {
    blogs(root, args, context, info) {
      return getAllBlogsHelper();
    },
    blog(root, {id}, context, info) {
      return getOneBlogHelper(id);
    }
  },
  Mutation: {
	createBlog(root, {input}, context, info) {
      return createBlogHelper(input);
    },
    updateBlog(root, {id, input}, context, info) {
      return updateBlogHelper(id, input);
    },
    deleteBlog(root, {id}, context, info) {
      return deleteBlogHelper(id);
    }
  }
};

// Build the schema with Type Definitions and Resolvers
const schema = graphqlTools.makeExecutableSchema({typeDefs, resolvers});


// Start the webserver
async function ws() {
  app.use('/graphql', graphql({
    graphiql: true,
    schema
  }));

  app.listen(port, function() {
    console.log('Listening on http://localhost:' + port + '/graphql');
  })
}

// Do it
let client;
async function run() {
  client = createClient();
  await ws();
}

function createClient() {
       return new NoSQLClient({
            region: Region.EU_FRANKFURT_1,
			compartment:'ocid1.compartment.oc1..aaaaaaaamgvdxnuap56pu2qqxrcg7qnvb4wxenqguylymndvey3hsyi57paa',
            auth: {
                iam: {
                    tenantId: 'ocid1.tenancy.oc1..aaaaaaaahrs4avamaxiscouyeoirc7hz5byvumwyvjedslpsdb2d2xe2kp2q',
                    userId: 'ocid1.user.oc1..aaaaaaaaqeq7zdo54v524lk5k2cxbnrowyp7p5f36r2s5co3ssybmexcu4ba',
                    fingerprint: 'e1:4f:7f:e7:b5:7c:11:38:ed:e5:9f:6d:92:bb:ae:3d',
                    privateKeyFile: 'NoSQLprivateKey.pem'
                }
            }
        });
}

run();
