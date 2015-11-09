"use strict";

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
          notEmpty: true,
          len: [8, 128]
        }
      },
      password_confirm: { 
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 128]
        }
      },
      password: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 128]
        }
      }
    }, 
    { 
      validate: {
        matchConfirmedPassword: function() {
          if (this.password !== this.password_confirm) {
            throw new Error('Confirmed password does not match')
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
        }
      }
    }
  );
  Account.password_confirm = '';

  return Account;
};
