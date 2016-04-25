'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var clipCtrlStub = {
  index: 'clipCtrl.index',
  show: 'clipCtrl.show',
  sendFile: 'clipCtrl.sendFile',
  recvFile: 'clipCtrl.recvFile',
  destroy: 'clipCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return 'authService.hasRole.' + role;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var clipIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './clip.controller': clipCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Clip API Router:', function() {

  it('should return an express router instance', function() {
    clipIndex.should.equal(routerStub);
  });

  describe('GET /api/clips', function() {

    it('should route to clip.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.hasRole.admin', 'clipCtrl.index')
        .should.have.been.calledOnce;
    });

  });


  describe('DELETE /api/clips/:id', function() {

    it('should route to clip.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'clipCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/clips/:id/file', function() {
    it('should route to clip.controller.sendFile', function() {
      routerStub.get
        .withArgs('/:id/file', 'authService.isAuthenticated', 'clipCtrl.sendFile')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/clips/:id/file', function() {
    it('should route to clip.controller.recvFile', function() {
      routerStub.post
        .withArgs('/:id/file', 'authService.isAuthenticated', 'clipCtrl.recvFile')
        .should.have.been.calledOnce;
    });
  });


});
