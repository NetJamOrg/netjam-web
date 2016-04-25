'use strict';

var app = require('../..');
import request from 'supertest';
import {Project, User} from '../../sqldb';

var newProject;

describe('Project API:', function() {
  var token;

  // Clear and setup projects and users and set token
  before(function(done) {
    var theUser;
    return User.destroy({ where: {} }).then(function() {
      User.create({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      })
        .then((user) => {
          user.save()
            .then(() => theUser = user)
            .then(() => {
              User.create({
                name: 'Fake User2',
                email: 'test2@example.com',
                password: 'password'
              })
                .then((user) => {
                  user.save()
                })
                .then(function() {
                  Project.create({
                    name: "super rad project",
                    pathToFile: "superradproject.json"
                  }).then((proj) => {
                    proj.addUser(theUser)
                      .then(() => {
                        request(app)
                          .post('/auth/local')
                          .send({
                            email: 'test@example.com',
                            password: 'password'
                          })
                          .expect(200)
                          .expect('Content-Type', /json/)
                          .end((err, res) => {
                            token = res.body.token;
                            done();
                          });
                      });
                  });
                });
            });
        });
    });
  });

  // Clear users after testing
  after(function() {
    return Project.destroy({ where: {} })
      .then(() => User.destroy({where: {}}));
  });

  describe('POST /api/projects', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/projects')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Project',
          pathToFile: 'somepath'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newProject = res.body;
          done();
        });
    });

    it('should respond with the newly created project', function() {
      newProject.name.should.equal('New Project');
      newProject.pathToFile.should.equal('somepath');
    });

  });

  describe('GET /api/projects/:id', function() {
    var project;

    beforeEach(function(done) {
      request(app)
        .get('/api/projects/' + newProject._id)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          project = res.body;
          done();
        });
    });

    afterEach(function() {
      project = {};
    });

    it('should respond with the requested project', function() {
      project.name.should.equal('New Project');
      project.pathToFile.should.equal('somepath');
    });

  });

  describe('PUT /api/projects/:id', function() {
    var updatedProject;

    beforeEach(function(done) {
      request(app)
        .put('/api/projects/' + newProject._id)
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'Updated Project',
          pathToFile: 'otherpath'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedProject = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedProject = {};
    });

    it('should respond with the updated project', function() {
      updatedProject.name.should.equal('Updated Project');
      updatedProject.pathToFile.should.equal('otherpath');
    });

  });

  describe('GET /api/projects/:id/users', function() {
    it("should get project's users if user in proj", function(done) {
      request(app)
        .get('/api/projects/' + newProject._id +'/users')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.be.instanceOf(Array);
          //          res.body.length.should.be.above(0);
          res.body.length.should.equal(1);
          res.body[0].email.should.equal('test@example.com');
          done();
        });
    });
  });

  describe('GET /api/projects/:id/clips', function() {
    it("should get project's clips if user in proj", function(done) {
      request(app)
        .get('/api/projects/' + newProject._id +'/clips')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.be.instanceOf(Array);
          done();
        });
    });
  });


  describe('GET /api/projects/:id/song', function() {
    it("should get project's song if user in proj", function(done) {
      request(app)
        .get('/api/projects/' + newProject._id +'/song')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          // just testing http code for now
          done();
        });
    });
  });



  describe('DELETE /api/projects/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/projects/' + newProject._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when project does not exist', function(done) {
      request(app)
        .delete('/api/projects/' + newProject._id)
        .set('authorization', 'Bearer ' + token)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
