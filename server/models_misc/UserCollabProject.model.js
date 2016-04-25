module.exports = function(sequelize, DataTypes) {
  var UserCollabProject = sequelize.define('UserCollabProject', {
  	access: {
  		type: DataTypes.INTEGER,
  		allowNull: false,
  		defaultValue: 0		// 0 = read, 1 = read/write, 2 = owner
		}
	}, {
		timestamps: true,
	});

  return UserCollabProject;
};
