'use strict';

module.exports = function(sequelize, DataTypes) {
  var Project = sequelize.define('Project', {
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
    pathToFile: DataTypes.STRING
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Project.belongsTo(models.Song);
        Project.hasMany(models.Clip);
        Project.belongsToMany(models.User, {through: models.UserCollabProject});
      }
    },

    getterMethods: {
      id: function() {
        return {
          'projectId': this._id
        };
      },

      // Project's data file filepath
      filepath: function() {
        return {
          'filepath': this.pathToFile
        };
      },

      // Simple stats for project
      info: function() {
        return {
          'name': this.name,
          'created': this.createdAt
        };
      }
    },

    hooks: { },
    instanceMethods: { }
  });

  return Project;
};
