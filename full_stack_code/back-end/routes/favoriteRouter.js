const express = require('express');
const bodyParser = require('body-parser');
const favoriteRouter = express.Router();
const Favorite = require('../models/favorites');
var authenticate = require('../authenticate.js');
const cors = require('./cors.js');
favoriteRouter.use(bodyParser.json());
favoriteRouter.route('/')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,authenticate.verifyUser,(req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Contenet-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => {
                next(err);
            })
    })
    .post(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if (favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
                if (!user)
                    user = new Favorite({ user: req.user._id });
                for (let i of req.body) {
                    if (user.dishes.find((d_id) => {
                        if (d_id._id) {
                            return d_id._id.toString() === i._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(i._id);
                }
                user.save()
                    .then((userFavs) => {
                        Favorite.findById(userFavs._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 201;
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorites);
                                console.log("Favourites Created");
                            })
                        
                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
    })
    .delete(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorite.remove({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Contenet-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => {
                next(err);
            })
    })
favoriteRouter.route('/:dishId')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Conten-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites })
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Conten-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites })
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Conten-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites })
                    }
                }
})
    })
    .post(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .then((favourites) => {
                var user;
                if (favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
                if (!user)
                    user = new Favorite({ user: req.user._id });

                user.dishes.push(req.params.dishId);
                user.save()
                    .then((userFavs) => {
                        Favorite.findById(userFavs._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 201;
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorites);
                                console.log("Favourites Created");
                            })

                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
    })
    .delete(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if (favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
                if (user) {
                    user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
                    user.save()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err));

                } else {
                    var err = new Error('You do not have any favourites');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
module.exports = favoriteRouter;