"use strict";

var bcrypt = require('bcrypt');
/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define("account", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Username is required"
          },
          len: {
            args: [8, 128],
            msg: "Username should be from 8 to 128 characters length"
          }
        }
      },
      password: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required"
          },
          len: {
            args: [8, 128],
            msg: "Password should be from 8 to 128 characters length"
          }
        }
      },
      password_confirm: { 
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password confirmation is required"
          },
          len: {
            args: [8, 128],
            msg: "Password confirmation should be from 8 to 128 characters length"
          }
        }
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true,
      validate: {
        matchConfirmedPassword: function() {
          if (this.password !== this.password_confirm) {
            throw new Error('Confirmed password does not match')
          }
        }
      },
      hooks: {
        afterValidate: function(account, options) {
          if (account.changed('password')) {
            account.password = account.password_confirm = bcrypt.hashSync(account.password, 8);
          }
        }
      },
      classMethods: {
        associate: function(models) {
          Account.hasOne(models.account_detail, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Account.belongsToMany(models.project, {
            through: models.account_project,
            as: "projects"
          });
          Account.hasMany(models.article, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return Account;
};
