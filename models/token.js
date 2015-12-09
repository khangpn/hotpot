"use strict";

var uuid = require('uuid');
var bcrypt = require('bcrypt');
/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var encryptToken = function(token){
      token.name = bcrypt.hashSync(token.name, 8);
    }
  }

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
      hooks: { 
        beforeCreate: function(token, options) {
          encryptToken(token);
        }
      },
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
      instanceMethods: { 
        validate: function() {
          var elapsedSeconds = (Date.now() - this.created_at) / 1000;
          return elapsedSeconds < this.ttl;
        }
      }
    }
  );

  return Token;
};
