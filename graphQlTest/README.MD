for get request 
http://localhost:4000/graphql/?query={users{name}}

and for post 
http://localhost:4000/graphql

open raw and enter

{
  "query": "mutation createUser { createUser(name: \"gagan\", email: \"gagan@gmail.com\") { name email } }"
}
