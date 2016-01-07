"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Priority = sequelize.define("priority", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Priority name is required"
          }
        }
      },
      level: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Priority level is required"
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
          Priority.hasMany(models.ticket, {
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return Priority;
};
