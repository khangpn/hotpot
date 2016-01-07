"use strict";

/*
* id, createdAt, updatedAt will be generated automatichally
*/
module.exports = function(sequelize, DataTypes) {
  var Ticket = sequelize.define("ticket", {
      name: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Ticket name is required"
          }        }
      },
      content: { 
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Ticket content is required"
          }
        }
      },
      due_date: { 
        type: DataTypes.DATE,
        allowNull: true,
        validate: { }
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
          Ticket.belongsTo(models.account, {
            as: 'owner',
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Ticket.belongsTo(models.account, {
            as: 'assignee',
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Ticket.belongsTo(models.project, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          });
          Ticket.belongsToMany(models.role, {
            through: models.ticket_role,
            as: "roles"
          });
          Ticket.belongsTo(models.security_level, {
            foreignKey: {
              allowNull: false
            }
          });
          Ticket.belongsTo(models.priority, {
            foreignKey: {
              allowNull: false
            }
          });
        }
      }
    }
  );

  return Ticket;
};
