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
    }
    //{ 
    //  classMethods: {
    //    associate: function(models) {
    //      AccountProject.belongsTo(models.account, {
    //        foreignKey: {
    //          //name: 'account_id',
    //          allowNull: false
    //        }
    //      });
    //      AccountProject.belongsTo(models.project, {
    //        foreignKey: {
    //          //name: 'project_id',
    //          allowNull: false
    //        }
    //      });
    //    }
    //  }
    //}
  );

  return AccountProject;
};
