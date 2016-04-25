'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var userCtrlStub = {
  index: 'userCtrl.index',
  destroy: 'userCtrl.destroy',
  me: 'userCtrl.me',
  changePassword: 'userCtrl.changePassword',
  show: 'userCtrl.show',
  create: 'userCtrl.create',
  getProjects: 'userCtrl.getProjects',
  getUserProjects: 'userCtrl.getUserProjects',
  getClips: 'userCtrl.getClips',
  getUserClips: 'userCtrl.getUserClips',
  getSongs: 'userCtrl.getSongs',
  getUserSongs: 'userCtrl.getUserSongs'

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
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var userIndex = proxyquire('./index', {
  'express': {
    Router() {
      return routerStub;
    }
  },
  './user.controller': userCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('User API Router:', function() {

  it('should return an express router instance', function() {
    userIndex.should.equal(routerStub);
  });

  describe('GET /api/users', function() {

    it('should verify admin role and route to user.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.hasRole.admin', 'userCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/users/:id', function() {

    it('should verify admin role and route to user.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.hasRole.admin', 'userCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/me', function() {

    it('should be authenticated and route to user.controller.me', function() {
      routerStub.get
        .withArgs('/me', 'authService.isAuthenticated', 'userCtrl.me')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/users/:id/password', function() {

    it('should be authenticated and route to user.controller.changePassword', function() {
      routerStub.put
        .withArgs('/:id/password', 'authService.isAuthenticated', 'userCtrl.changePassword')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id', function() {

    it('should be authenticated and route to user.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'userCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/users', function() {

    it('should route to user.controller.create', function() {
      routerStub.post
        .withArgs('/', 'userCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/projects', function() {
    it('should be authenticated and route to user.controller.getProjects', function() {
      routerStub.get
        .withArgs('/projects', 'authService.isAuthenticated', 'userCtrl.getProjects')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id/projects', function() {
    it('should be admin and route to user.controller.getUserProjects', function() {
      routerStub.get
        .withArgs('/:id/projects', 'authService.hasRole.admin', 'userCtrl.getUserProjects')
        .should.have.been.calledOnce;
    });
  });

    describe('GET /api/users/songs', function() {
    it('should be authed and route to user.controller.getSongs', function() {
      routerStub.get
        .withArgs('/songs', 'authService.isAuthenticated', 'userCtrl.getSongs')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id/songs', function() {
    it('should be admin and route to user.controller.getUserSongs', function() {
      routerStub.get
        .withArgs('/:id/songs', 'authService.hasRole.admin', 'userCtrl.getUserSongs')
        .should.have.been.calledOnce;
    });
  });
  describe('GET /api/users/clips', function() {
    it('should be authenticated and route to user.controller.getClips', function() {
      routerStub.get
        .withArgs('/clips', 'authService.isAuthenticated', 'userCtrl.getClips')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id/clips', function() {
    it('should be admin and route to user.controller.getUserClips', function() {
      routerStub.get
        .withArgs('/:id/clips', 'authService.hasRole.admin', 'userCtrl.getUserClips')
        .should.have.been.calledOnce;
    });
  });


});
