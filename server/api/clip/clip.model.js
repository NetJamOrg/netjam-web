'use strict';


module.exports = function(sequelize, DataTypes) {
  var Clip = sequelize.define('Clip', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    pathToFile: DataTypes.STRING,
  }, {
    timestamps: true,
    
    classMethods: {
      associate: function(models) {
        Clip.belongsTo(models.User);
        Clip.belongsTo(models.Project);
      }
    },

    getterMethods: {
      id: function() {
        return this._id;
      },

      filepath: function() {
        return this.pathToFile;
      },

      createdBy: function() {
        return this.userId;
      },
    },

    hooks: { },
    instanceMethods: { }
  });

  return Clip;
};
