'use strict';


module.exports = function(sequelize, DataTypes) {
  var Song = sequelize.define('Song', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      collate: 'nocase',
      validate: {
        notEmpty: true
      }
    },
    pathToFile: DataTypes.STRING,
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Song.hasOne(models.Project);
        Song.belongsToMany(models.User, {through: models.UserLikeSong});
      }
    },

    getterMethods: {
      brief: function() {
        return {
          '_id': this._id,
          'name': this.name,
          'pathToFile': this.pathToFile,
        };
      },

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

  return Song;
};
