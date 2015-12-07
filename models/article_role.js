"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var ArticleRole = sequelize.define("article_role", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true
    }
  );

  return ArticleRole;
};
