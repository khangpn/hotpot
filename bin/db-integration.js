var models = require('./../models');

models.sequelize.sync().then(function() {
  console.log("Done syncing");
  console.log("Adding testing data");
  var Account = models.account;
  var Detail = models.account_detail;
  var Role = models.role;
  var Security = models.security_level;
  var Project = models.project;
  var Article = models.article;
  var Priority = models.priority;

  Account.create({
    name: 'khangnguyen',
    password: 'qweasdzxc',
    password_confirm: 'qweasdzxc',
    is_admin: true,
    account_detail: {
      fullname: 'khang nguyen',
      email: 'khang@hotpot.com'
    }
  }, {
    include: [Detail]
  })
  .then(function(account){
      // ========================== Create Role
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

      // ========================== Create Project
      Project.create(
        {
          name: 'hotpot',
          description: 'my thesis',
          owner_id: account.id,
          due_date: '2016-01-30'
        }
      )
      .then(function(project){
        // ========================== Create Security
        Security.create(
          {
            name: 'uncategoried',
            level: 1,
            description: 'bottom of the food chain'
          }
        )
        .then(function(security_level){
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
        .then(function(security_level){
          // ========================== Create Article
          Article.create(
            {
              name: 'plan',
              description: 'planning',
              content: 'this is a plan',
              writable: true,
              readable: true,
              account_id: account.id,
              project_id: project.id,
              security_id: security_level.id
            }
          )
          .then(function(article){
            }, function(error){
              console.log(error);
            });

          // ========================== Create Priority
          Priority.create(
            {
              name: 'normal',
              level: 1,
              description: 'do it'
            }
          )
          .then(function(security_level){
            }, function(error){
              console.log(error);
            });
          Priority.create(
            {
              name: 'high',
              level: 2,
              description: 'do it quick'
            }
          )
          .then(function(security_level){
            }, function(error){
              console.log(error);
            });
          Priority.create(
            {
              name: 'urgent',
              level: 3,
              description: 'run, run for your life'
            }
          )
          .then(function(security_level){
            }, function(error){
              console.log(error);
            });

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
        .then(function(security_level){
          }, function(error){
            console.log(error);
          });
      }, function(error){
        console.log(error);
      });
    }, function(error){
      console.log(error);
    });
});
