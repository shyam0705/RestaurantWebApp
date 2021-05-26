var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promotionRouter = require('./routes/promotionRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');
var commentRouter = require('./routes/commentRouter');
const mongoose = require('mongoose');
var config = require('./config');
const Dishes = require('./models/dishes');
const url = config.mongoUrl;
const connect = mongoose.connect(url);
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
const cors = require('cors');

connect.then((db) => {
    console.log("connected correctly to server");
}, (err) => {
        console.log(err);
})


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());

app.all("*", (req, res, next) => {
    if (req.secure) {
        return next();
    }
    else {
        res.redirect(307, 'https://' + req.hostname + ':' + app.get('securePort') + req.url);
    }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/dishes', dishRouter);
app.use('/promotions', promotionRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);
app.use('/comments', commentRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
