'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var projectCtrlStub = {
  index: 'projectCtrl.index',
  show: 'projectCtrl.show',
  create: 'projectCtrl.create',
  update: 'projectCtrl.update',
  destroy: 'projectCtrl.destroy',
  getUsers: 'projectCtrl.getUsers',
  getClips: 'projectCtrl.getClips',
  getSong: 'projectCtrl.getSong',
  createClip: 'projectCtrl.createClip',
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
var projectIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './project.controller': projectCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Project API Router:', function() {

  it('should return an express router instance', function() {
    projectIndex.should.equal(routerStub);
  });

  describe('GET /api/projects', function() {

    it('should verify admin role and route to project.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.hasRole.admin', 'projectCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/projects/:id', function() {

    it('should verify authentication and route to project.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'projectCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/projects', function() {

    it('should verify auth and route to project.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'projectCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/projects/:id', function() {

    it('should verify auth and route to project.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'projectCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/projects/:id', function() {

    it('should verify auth and route to project.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'projectCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/projects/:id', function() {

    it('should verify auth and route to project.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'projectCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/projects/:id/users', function() {
    it('should verify auth and route to project.controller.getUsers', function() {
      routerStub.get
        .withArgs('/:id/users', 'authService.isAuthenticated', 'projectCtrl.getUsers')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/projects/:id/clips', function() {
    it('should verify auth and route to project.controller.getClips', function() {
      routerStub.get
        .withArgs('/:id/clips', 'authService.isAuthenticated', 'projectCtrl.getClips')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/projects/:id/song', function() {
    it('should verify auth and route to project.controller.getSong', function() {
      routerStub.get
        .withArgs('/:id/song', 'authService.isAuthenticated', 'projectCtrl.getSong')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/projects/:id/clip', function() {
    it('should verify auth and route to project.controller.createClip', function() {
      routerStub.post
        .withArgs('/:id/clip', 'authService.isAuthenticated', 'projectCtrl.createClip')
        .should.have.been.calledOnce;
    });
  });


});
