# demo-graphql-nosql

Deployment

````
cd ~/demonosql/graphql_nosql/
npm start
````

USE INTERFACE GraphIQL http://host:3000/graphql
USE POSTMAN

Deployment using docker

````
docker build -t graphql_nosql .
docker run -p 3000:3000  graphql_nosql 
````

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
