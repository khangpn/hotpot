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
  );

  return AccountProject;
};
