# NetJam

This is the source code of the NetJam web application.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [SQLite](https://www.sqlite.org/quickstart.html)

### Developing

Please see our final report for more detailed instructions.

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Install the program `sox` on your system.

3. Run `grunt serve` to start the development server.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma. Some tests are known to fail, so run with the --force flag to see them all.
