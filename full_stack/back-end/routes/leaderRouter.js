const express = require('express');
const bodyParser = require('body-parser');
const leaderRouter = express.Router();
const Leader = require('../models/leaders.js');
const cors = require('./cors.js');
var authenticate = require('../authenticate.js');
leaderRouter.use(bodyParser.json());
leaderRouter.route('/')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,(req, res, next) => {
        Leader.find(req.query)
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leaders);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })

    })
    .post(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        Leader.create(req.body)
            .then((leader) => {
                console.log("leader created:", leader);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })
    })
    .put(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .delete(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        Leader.remove({})
            .then((resp) => {
                console.log("all leaders removed");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })
    })
leaderRouter.route('/:leaderId')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,(req, res, next) => {
        Leader.findById(req.params.leaderId)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })
    })
    .post(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .put(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        Leader.findByIdAndUpdate(req.params.leaderId, { $set: req.body }, { new: true })
            .then((leader) => {
                console.log("leader with id:" + req.params.leaderId + "is updated", leader);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })
    })
    .delete(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        Leader.findByIdAndRemove(req.params.leaderId)
            .then((resp) => {
                console.log("leader with id: " + req.params.leaderId+"removed");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => { next(err) })

            .catch((err) => {
                next(err);
            })
            
    })
module.exports = leaderRouter;