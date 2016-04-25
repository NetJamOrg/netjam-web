'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection opions
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'dev.sqlite',
      define: {
        timestamps: false
      }
    }
  },

  // Seed database on startup
  seedDB: true,

  // diffsync socket.io port
  diffSync: {
    port: 4000,
    syncMilliseconds: 2000,
    projectJSONDirectory: './projectInfos' // relative to path we're run from
  }

};
