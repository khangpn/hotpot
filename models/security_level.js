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
          },
          len: {
            args: [8, 128],
            msg: "Level name should be from 8 to 128 characters length"
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
      }
    }, 
    { 
      classMethods: {
        associate: function(models) {
          Level.hasMany(models.account, {
            onDelete: "CASCADE"
          });
        }
      }
    }
  );

  return Level;
};
