'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  sequelize: {
    uri:  process.env.SEQUELIZE_URI ||
          'sqlite://',
    options: {
      logging: false,
      storage: 'dist.sqlite',
      define: {
        timestamps: false
      }
    }
  },

  // diffsync socket.io port
  diffSync: {
    port: process.env.DS_PORT || 4000,
    syncMilliseconds: 2000,
    projectJSONDirectory: './projectInfos' // relative to path we're run from
  }

};
