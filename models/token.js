"use strict";

var uuid = require('uuid');
/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Token = sequelize.define("token", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: {
            args: [8, 128],
            msg: "Token should be from 8 to 128 characters length"
          }
        }
      },
      ttl: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1209600,
        validate: {
          notEmpty: {
            msg: "ttl is required"
          }
        }
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true,
      validate: { },
      hooks: { },
      classMethods: {
        associate: function(models) {
          Token.belongsTo(models.account, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
        },
        generateToken: function() {
          return Token.build({
            name: uuid.v1()
          });
        }
      },
      instanceMethods: { }
    }
  );

  return Token;
};
