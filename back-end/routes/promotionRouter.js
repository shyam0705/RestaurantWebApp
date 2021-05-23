const express = require('express');
const bodyParser = require('body-parser');
const promotionRouter = express.Router();
const Promotion = require('../models/promotions.js');
var authenticate = require('../authenticate.js');
const  cors  = require('./cors.js');
promotionRouter.use(bodyParser.json());
promotionRouter.route('/')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,(req, res, next) => {
        Promotion.find(req.query)
            .then((promotions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, (err) => next(err))
            .catch((err) => {
                next(err);
            })
    })
    .post(cors.corswithOptions,authenticate.verifyUser,(req, res, next) => {
        Promotion.create(req.body)
            .then((promotion) => {
                console.log("promotion created:", promotion);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => next(err))
            .catch((err) => { next(err)})
    })
    .put(cors.corswithOptions,authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .delete(cors.corswithOptions,authenticate.verifyUser,(req, res, next) => {
        Promotion.remove({})
            .then((resp) => {
                console.log("all promotions is removed");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            })
            .catch((err) => {
                next(err);
            })
    })
promotionRouter.route('/:promotionId')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors,(req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(promotion);

            }, (err) => { next(err) })

            .catch((err)=>next(err))
    })
    .post(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .put(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        Promotion.findByIdAndUpdate(req.params.promotionId, { $set: req.body }, { new: true })
            .then((promotion) => {
                console.log("promotion with id:" + req.params.promotionId + "is updated:");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => { next(err) })
            .catch((err) => {
                next(err);
            })
    })
    .delete(cors.corswithOptions,authenticate.verifyUser,(req, res, next) => {
        Promotion.findByIdAndRemove(req.params.promotionId)
            .then((resp) => {
                console.log("removed promotion with id:", req.params.promotionId);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
            }, (err) => { next(err)})
            .catch((err) => {
                next(err);
            })
    })
module.exports = promotionRouter;