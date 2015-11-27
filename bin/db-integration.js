var models = require('./../models');

models.sequelize.sync().then(function() {
  console.log("Done syncing");
  console.log("Adding testing data");
  var Account = models.account;
  var Detail = models.account_detail;
  var Role = models.role;
  var Security = models.security_level;
  var Project = models.project;

  Account.create({
    name: 'khangnguyen',
    password: 'qweasdzxc',
    password_confirm: 'qweasdzxc',
    account_detail: {
      fullname: 'khang nguyen',
      email: 'khang@hotpot.com'
    }
  }, {
    include: [Detail]
  })
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });

  Role.create(
    {
      name: 'programmer',
      description: 'he codes for food'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });
  Role.create(
    {
      name: 'designer',
      description: 'she draw on walls'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });
  Role.create(
    {
      name: 'project manager',
      description: 'he pushes you to the cliff then smiles'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });

  Security.create(
    {
      name: 'uncategoried',
      level: 1,
      description: 'bottom of the food chain'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });
  Security.create(
    {
      name: 'secret',
      level: 2,
      description: 'do not tell anyone'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });
  Security.create(
    {
      name: 'top secret',
      level: 3,
      description: '*flash* you know nothing'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });

  Project.create(
    {
      name: 'hotpot',
      description: 'my thesis',
      due_date: '2016-01-30'
    }
  )
  .then(function(newAcc){
    }, function(error){
      console.log(error);
    });
});
