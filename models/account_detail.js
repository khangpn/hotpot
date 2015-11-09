"use strict";

module.exports = function(sequelize, DataTypes) {
  var AccountDetail = sequelize.define('account_detail', {
      fullname: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 128]
        }
      },
      email: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
          len: [3, 128]
        }
      }
    },
    { 
      classMethods: {
        associate: function(models) {
          AccountDetail.belongsTo(models.account, {
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return AccountDetail
};
