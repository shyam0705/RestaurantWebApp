var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');
const  cors  = require('./cors');
const session = require('express-session');
router.use(bodyParser.json());
/* GET users listing. */
router.options(cors.corswithOptions, (req, res) => {
     res.statusCode = 200;
})
router.get('/', cors.cors, function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup', cors.corswithOptions,(req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            }
            else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, status: 'Registration Successful!' });
                    });
                });
                    
                
            }
        });
});

router.post('/login', cors.corswithOptions, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: 'login fail', err: info });
        }
        req.logIn(user, (err) => {
            if (err) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: false, status: 'login fail', err: 'could not login user' });
            }
            var token = authenticate.getToken({ _id: req.user._id })
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, token: token, status: 'You are successfully logged in!' });
        });
       
    })(req, res, next);
   
});

router.get('/logout', cors.corswithOptions,(req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
})
router.get('/checkJWTToken', cors.corswithOptions, (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ status: 'JWT invalid', success: false, err: info })
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ status: 'JWT valid', success: true, user: user })
        }
    })(req, res);
})
module.exports = router;
