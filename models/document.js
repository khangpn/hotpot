"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Document = sequelize.define("document", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Document name is required"
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
            msg: "Document content is required"
          }
        }
      }
    }, 
    { 
      classMethods: {
        associate: function(models) {
          Document.belongsTo(models.account, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Document.belongsTo(models.project, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Document.belongsToMany(models.role, {
            through: models.document_role,
            as: "roles"
          });
          Document.belongsTo(models.security_level, {
            onDelete: "CASCADE"
          });
        }
      }
    }
  );

  return Document;
};
