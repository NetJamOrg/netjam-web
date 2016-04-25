'use strict';

var app = require('../..');
import request from 'supertest';
import {Project, User, Clip} from '../../sqldb';

var newClip;

describe('Clip API:', function() {
  var token; // auth token

  // Clear and setup projects and users and set token
  before(function(done) {
    var theUser;
    return User.destroy({ where: {} }).then(function() {
      User.create({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      }).then((user) => {
        theUser = user;
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

  // Clear users after testing
  after(function() {
    return Project.destroy({ where: {} })
      .then(() => User.destroy({where: {}}));
  });

  describe('DELETE /api/clips/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/clips/' + newClip._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when clip does not exist', function(done) {
      request(app)
        .delete('/api/clips/' + newClip._id)
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
