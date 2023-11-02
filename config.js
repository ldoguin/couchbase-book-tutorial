module.exports = {
    cluster: {
      connectionString: process.env.PUBLIC_CONNECT_STRING || 'couchbase://localhost', // Your Couchbase Capella connection string
      username: process.env.CB_USERNAME  ||  'Administrator',                 // Your Couchbase Capella username
      password: process.env.CB_PASSWORD ||  'password',                 // Your Couchbase Capella password
    },
  };
  