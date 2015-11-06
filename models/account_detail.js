"use strict";

module.exports = function(sequelize, DataTypes) {
  var AccountDetail = sequelize.define('account_detail', {
      fullname: { 
        type: DataTypes.STRING, 
        required: true 
      },
      email: { 
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
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
