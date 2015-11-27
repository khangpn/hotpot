"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var AccountProject = sequelize.define("account_project", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      underscored: true,
      freezeTableName: true,
      classMethods: {
        associate: function(models) {
          AccountProject.belongsToMany(models.role, {
            through: models.account_role,
            as: "roles"
          });
          AccountProject.belongsTo(models.security_level, {
          });
          AccountProject.belongsTo(models.account, {
          });
          AccountProject.belongsTo(models.project, {
          });
        }
      }
    }
  );

  return AccountProject;
};
