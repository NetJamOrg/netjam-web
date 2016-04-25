/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
var Thing = sqldb.Thing;
var User = sqldb.User;
var Project = sqldb.Project;
var UserCollabProject = sqldb.UserCollabProject;
var Clip = sqldb.Clip;
var Song = sqldb.Song;

// seeds used in bulkCreate during population of data
var seeds = {
  project: [
    { _id: 1, name: "Test Project", pathToFile: "1.json" },
    { _id: 2, name: "Test Project 2", pathToFile: null }
  ],

  clip: [
    { _id: 1, name: 'boop', pathToFile: 'clipStorage/1.wav' },
    { name: 'testclip1', pathToFile: 'testclip1.flac' },
    { name: 'testclip2', pathToFile: 'testclip2.flac' },
    { name: 'testclip3', pathToFile: 'testclip3.flac' },
    { name: 'testclip4', pathToFile: 'testclip4.flac' },
    { name: 'testclip5', pathToFile: 'testclip5.flac' },
    { name: 'testclip6', pathToFile: 'testclip6.flac' }
  ],

  user: [
    { provider: 'local', name: 'Test User', email: 'test@example.com', password: 'test', website: 'testband.com', description: "lorem ipsum seed my music!", shortmessage: "na na na la la la", backgroundImgPath: "http://lorempixel.com/850/280/nightlife/4/", avatarImgPath: "http://lorempixel.com/180/180/people/5/", twitterProfile: "thebesttweetr", facebookProfile: "Music Professorz" },
    { provider: 'local', role: 'admin', name: 'Admin', email: 'admin@example.com', password: 'admin', website: 'testband2.com', description: "word.", shortmessage: "na na na la la la", backgroundImgPath: "http://lorempixel.com/850/280/nightlife/3/", avatarImgPath: "http://lorempixel.com/180/180/people/1/", twitterProfile: "thebesttweetr", facebookProfile: "Music Professorz" },
    { provider: 'local', name: 'Test User 2', email: 'test2@example.com', password: 'test', website: 'testband3.com', description: "Check out how cool we are!", shortmessage: "na na na la la la", backgroundImgPath: "http://lorempixel.com/850/280/nightlife/2/", avatarImgPath: "http://lorempixel.com/180/180/people/6/", twitterProfile: "thebesttweetr", facebookProfile: "Music Professorz" },
    { provider: 'local', name: 'Test User 3', email: 'test3@example.com', password: 'test', website: 'testband4.com', description: "I'm test user 3, the best of the best.", shortmessage: "na na na la la la", backgroundImgPath: "http://lorempixel.com/850/280/nightlife/1/", avatarImgPath: "http://lorempixel.com/180/180/people/4/", twitterProfile: "thebesttweetr", facebookProfile: "Music Professorz" }
  ],

  song: [
    { name: 'testsong1', pathToFile: null }
  ],

  thing: [
    { name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
             'Stylus, Sass, and Less.' },
    { name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
             'AngularJS, and Node.' },
    { name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
             'tests alongside code. Automatic injection of scripts and ' +
             'styles into your index.html' },
    { name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
             'code reusability and maximum scalability' },
    { name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
             'payload, minifies your scripts/css/images, and rewrites asset ' +
             'names for caching.' },
    { name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
             'and openshift subgenerators' }
    ]
};

Thing.sync()
  .then(() => {
    return Thing.destroy({ where: {} });
  })
  .then(() => {
    Thing.bulkCreate(seeds.thing).then(() => {console.log('seed: finished populating things')});
  });

// populate the important things. -- this is horrible to look at
Project.sync()
  .then(() => UserCollabProject.sync())
  .then(() => { return Project.destroy({ where: {} }); })
  .then(() => {
    Project.bulkCreate(seeds.project)
    .then(() => {console.log('seed: finished populating projects')})
    .then(() => {
      User.sync()
      .then(() => { return User.destroy({ where: {} }); })
      .then(() => {
        User.bulkCreate(seeds.user)
        .then(() => {console.log('seed: finished populating users')})
        .then(() => {
          Clip.sync()
          .then(() => { return Clip.destroy( { where: {} }); })
          .then(() => {
            Clip.bulkCreate(seeds.clip)
            .then(() => {console.log('seed: finished populating clips')})
            .then(() => {
              Song.sync()
              .then(() => { return Song.destroy( { where: {} }); })
              .then(() => {
                Song.bulkCreate(seeds.song)
                .then(() => {console.log('seed: finished populating songs')})
                .then(() => {

                  //  bulkCreate's return doesn't include ids, so findAndCountAll is used
                  Project.findAndCountAll().then((projects) => {
                    User.findAndCountAll().then((users) => {
                      Song.findAndCountAll().then((songs) => {
                        Clip.findAndCountAll().then((clips) => {
                          if (!projects.count || !users.count || !clips.count || !songs.count) {
                            console.log('Seed error - models not synced. Restart your grunt job NOW');
                          } else {
                            // populate foreign keys/associations

                            projects.rows[0].setSong(songs.rows[0]);

                            projects.rows[0].addUser(users.rows[0], {access: 2});
                            projects.rows[0].addUser(users.rows[2], {access: 1});
                            projects.rows[0].addUser(users.rows[3], {access: 0});

                            projects.rows[0].addClips([clips.rows[0], clips.rows[1], clips.rows[2], clips.rows[3]]);

                            projects.rows[1].addUser(users.rows[3], {access: 2});
                            projects.rows[1].addUser(users.rows[0], {access: 0});

                            projects.rows[1].addClips([clips.rows[4], clips.rows[5]]);

                            clips.rows[0].setUser(users.rows[0]);
                            clips.rows[1].setUser(users.rows[0]);
                            clips.rows[2].setUser(users.rows[2]);
                            clips.rows[3].setUser(users.rows[2]);
                            clips.rows[4].setUser(users.rows[0]);
                            clips.rows[5].setUser(users.rows[2]);

                            users.rows[0].addLikedUser(users.rows[1]);
                            users.rows[1].addLikedUser(users.rows[0]);
                            users.rows[2].addLikedUser(users.rows[0]);
                            users.rows[0].addLikedSong(songs.rows[0]);
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
