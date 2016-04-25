module.exports = function(sequelize, DataTypes) {
  var UserLikeSong = sequelize.define('UserLikeSong', {
	}, {
		timestamps: true,
	});

  return UserLikeSong;
};