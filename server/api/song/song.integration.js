'use strict';

var app = require('../..');
import request from 'supertest';

var newSong;

describe('Song API:', function() {

  describe('GET /api/songs', function() {
    var songs;

    beforeEach(function(done) {
      request(app)
        .get('/api/songs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          songs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      songs.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/songs', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/songs')
        .send({
          name: 'New Song',
          info: 'This is the brand new song!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSong = res.body;
          done();
        });
    });

    it('should respond with the newly created song', function() {
      newSong.name.should.equal('New Song');
      newSong.info.should.equal('This is the brand new song!!!');
    });

  });

  describe('GET /api/songs/:id', function() {
    var song;

    beforeEach(function(done) {
      request(app)
        .get('/api/songs/' + newSong._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          song = res.body;
          done();
        });
    });

    afterEach(function() {
      song = {};
    });

    it('should respond with the requested song', function() {
      song.name.should.equal('New Song');
      song.info.should.equal('This is the brand new song!!!');
    });

  });

  describe('PUT /api/songs/:id', function() {
    var updatedSong;

    beforeEach(function(done) {
      request(app)
        .put('/api/songs/' + newSong._id)
        .send({
          name: 'Updated Song',
          info: 'This is the updated song!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSong = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSong = {};
    });

    it('should respond with the updated song', function() {
      updatedSong.name.should.equal('Updated Song');
      updatedSong.info.should.equal('This is the updated song!!!');
    });

  });

  describe('DELETE /api/songs/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/songs/' + newSong._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when song does not exist', function(done) {
      request(app)
        .delete('/api/songs/' + newSong._id)
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
