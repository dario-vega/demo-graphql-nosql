# demo-graphql-nosql

## Deployment
1. Clone this repository
2. Copy your API Keys to graphql_nosql repository (NoSQLprivateKey.pem) and modify the credentials in the code (for demo purpose, use profiles for production)
3. Run using Instance Principals when deploying in OCI

````
export NOSQL_REGION='US_ASHBURN_1'
export NOSQL_COMPID='ocid1.compartment.oc1..xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

cd ~/demo-graphql-nosql/blogloader/
npm install
node load.js cloud
node read.js cloud

cd ~/demo-graphql-nosql/graphql_nosql/
npm install
npm start
````

## Deployment using docker

````
docker build -t graphql_nosql .
docker run -p 3000:3000  graphql_nosql 
````

## TEST

1. USE INTERFACE GraphIQL http://host:3000/graphql
2. USE POSTMAN



GraphQL queries
````

{
  blogs {
    id
    blog
  }
}

{
  blog(id: 2) {
    id
    blog
  }
}

mutation {
  updateBlog(id: 92, input: {blog: "test update DV"}) {
    id
	blog
  }
}

mutation {
  createBlog(input: {blog: "test create"}) {
    id
	blog
  }
}

mutation {
  deleteBlog(id: 92) {
    id
    blog
  }
}
````
