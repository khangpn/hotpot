"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define("role", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Role name is required"
          },
          len: {
            args: [8, 128],
            msg: "Role name should be from 8 to 128 characters length"
          }
        }
      },
      description: { 
        type: DataTypes.TEXT
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true,
      classMethods: {
        associate: function(models) {
          Role.belongsToMany(models.account_project, {
            through: models.account_role,
            as: "accounts"
          });
          Role.belongsToMany(models.article, {
            through: models.article_role,
            as: "articles"
          });
        }
      }
    }
  );

  return Role;
};
