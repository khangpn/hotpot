"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define("article", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Article name is required"
          }        }
      },
      description: { 
        type: DataTypes.TEXT,
      },
      content: { 
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Article content is required"
          }
        }
      },
      writable: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      readable: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, 
    { 
      underscored: true,
      freezeTableName: true,
      classMethods: {
        associate: function(models) {
          Article.belongsTo(models.account, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Article.belongsTo(models.project, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Article.belongsToMany(models.role, {
            through: models.article_role,
            as: "roles"
          });
          Article.belongsTo(models.security_level, {
          });
        }
      }
    }
  );

  return Article;
};
