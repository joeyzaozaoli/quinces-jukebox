const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const Song = require('./db/config').Song;
const User = require('./db/config').User;
const spotifyHelpers = require('./helpers/spotifyHelpers.js');

const app = express();

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Webpack
* * * * * * * * * * * * * * * * * * * * * * * * * * */

const env = require('./env/credentials.js');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require(`./webpack.config${env.prod ? '.prod' : ''}.js`);
const compiler = webpack(webpackConfig);

if (!env.prod) {
  app.use(webpackDevMiddleware(compiler, {
      hot: true,
      filename: 'bundle.js',
      publicPath: '/',
      stats: {
      colors: true,
    },
    historyApiFallback: true,
  }));
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Middleware
* * * * * * * * * * * * * * * * * * * * * * * * * * */

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Router
* * * * * * * * * * * * * * * * * * * * * * * * * * */

app.get('/songs', (req, res) => {
  Song.find({}).sort({netVoteCount: 'descending'}).limit(50)
  .then((songs) => {
    res.json(songs);
  });
});

app.get('/songs/search', (req, res) => {
  spotifyHelpers.getTrackSearchResults(req.query.query)
  .then((songs) => {
      res.json(songs);
    });
});

app.post('/songs', (req, res) => {
  const newSong = new Song({
    name: req.body.name,
    image: req.body.image,
    link: req.body.link,
    userName: req.body.userName,
    artist: req.body.artist
  });

  User.findOne({name: req.body.userName})
  .then((user) => {
    if (user) {
      user.addedSongs.push(newSong);
      user.save();
      return newSong.save();
    }
  })
  .then(() => {
    res.sendStatus(201);
  });
});

app.put('/song', (req, res) => {
  Song.findOne({name: req.body.name})
  .then((song) => {
    if (song) {
      if(req.body.vote > 0) {
        song.upVoteCount++;
      } else {
        song.downVoteCount++;
      }
      song.save();
      res.sendStatus(201);
    }
  });
});

app.delete('/song', (req, res) => {
  const songId = req.query.id;
  Song.remove({'_id': songId})
  .then(() => {
    res.sendStatus(201);
  });
});

app.get('/users', (req,res) => {
  User.find({})
  .then((users) => {
    res.json(users);
  });
});

app.post('/signup', (req, res) => {
  const newUser = new User({
    name: req.body.username
  });

  User.findOne({name: req.body.username})
  .then((user) => {
    if (!user) {
      newUser.save()
      .then(() => {
        req.session.username = req.body.username;
        res.sendStatus(201);
      });
    } else {
      res.send('User already exist!');
    }
  });
});

app.get('/hostLogin', (req, res) => { // host authentication
  spotifyHelpers.handleHostLogin(req, res);
});

app.get('/callback', (req, res) => { // host authentication
  spotifyHelpers.redirectAfterLogin(req, res);
});

app.get('/*', (req, res) => {
  res.status(404).send('Not Found');
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Server
* * * * * * * * * * * * * * * * * * * * * * * * * * */

const server = app.listen(3000, () => {
  console.log('Listening at http://localhost:3000');
});

