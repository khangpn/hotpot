"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define("account", {
      name: { 
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      password: { 
        type: 'text',
        allowNull: true
      }
    }, 
    { 
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

  return Account;
};
