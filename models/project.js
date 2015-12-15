"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Project = sequelize.define("project", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Project name is required"
          },
          len: {
            args: [1, 128],
            msg: "Project name should be from 1 to 128 characters length"
          }
        }
      },
      description: { 
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [8, 256],
            msg: "Project description should be from 8 to 256 characters length"
          }
        }
      },
      due_date: { 
        type: DataTypes.DATE,
        allowNull: true,
        validate: { }
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true,
      classMethods: {
        associate: function(models) {
          Project.belongsToMany(models.account, {
            through: models.account_project,
            as: "accounts"
          });
          Project.belongsTo(models.account, {
            foreignKey: 'owner_id',
            as: "owner"
          });
          Project.hasMany(models.article, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return Project;
};
