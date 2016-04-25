'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var songCtrlStub = {
  index: 'songCtrl.index',
  show: 'songCtrl.show',
  create: 'songCtrl.create',
  update: 'songCtrl.update',
  destroy: 'songCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var songIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './song.controller': songCtrlStub
});

describe('Song API Router:', function() {

  it('should return an express router instance', function() {
    songIndex.should.equal(routerStub);
  });

  // describe('GET /api/songs', function() {
  //   it('should route to song.controller.index', function() {
  //     routerStub.get
  //       .withArgs('/', 'songCtrl.index')
  //       .should.have.been.calledOnce;
  //   });

  // });

  // describe('DELETE /api/songs/:id', function() {
  //   it('should route to song.controller.destroy', function() {
  //     routerStub.delete
  //       .withArgs('/:id', 'songCtrl.destroy')
  //       .should.have.been.calledOnce;
  //   });
  // });

});
