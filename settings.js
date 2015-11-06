var settings = {
  development: {
    database: {
      database : "hotpot",
      username : "hotpot",
      password : "hotpot",
      options  : {
        dialect : "postgresql",
        host     : "127.0.0.1"
      }
    }
  },
  production: {
    database: {
      database : "hotpot",
      username : "hotpot",
      password : "hotpot",
      options  : {
        dialect : "postgresql",
        host     : "127.0.0.1"
      }
    }
  }
};

module.exports = settings;
