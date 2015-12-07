"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Level = sequelize.define("security_level", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Level name is required"
          }
        }
      },
      level: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Level is required"
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
          Level.hasMany(models.account_project, {
            onDelete: "CASCADE",
            as: 'accounts'
          });
          Level.hasMany(models.article, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return Level;
};
