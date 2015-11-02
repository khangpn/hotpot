var settings = {
  development: {
    database: {
      protocol : "postgresql",
      query    : { pool: true },
      host     : "127.0.0.1",
      database : "hotpot",
      user     : "hotpot",
      password : "hotpot"
    }
  },
  production: {
    database: {
      protocol : "postgresql",
      query    : { pool: true },
      host     : "127.0.0.1",
      database : "hotpot",
      user     : "hotpot",
      password : "hotpot"
    }
  }
};

module.exports = settings;
