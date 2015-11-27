"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var AccountRole = sequelize.define("account_role", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      underscored: true,
      freezeTableName: true,
      tableName: 'account_role'
    }
  );

  return AccountRole;
};
