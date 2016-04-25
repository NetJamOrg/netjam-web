module.exports = function(sequelize, DataTypes) {
  var UserLikeUser = sequelize.define('UserLikeUser', {
	}, {
		timestamps: true,
	});

  return UserLikeUser;
};