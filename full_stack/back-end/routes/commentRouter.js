const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate.js');
const cors = require('./cors.js');

const Comments = require('../models/comments');
var commentRouter = express.Router();
commentRouter.use(bodyParser.json());
commentRouter.route('/')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query)
            .populate('author')
            .then((comments) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comments);
            },err=>next(err))
            .catch((err) => {
                next(err);
            })
    })
    .post(cors.corswithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.body != null) {
            req.body.author = req.user._id;
            req.body.dish = req.query;
            Comments.create(req.body)
                .then((comment) => {
                    Comments.findById(comment._id)
                        .populate('author')
                        .then((comment) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(comment);
                        })
                }, err => next(err))
                .catch((err) => {
                    next(err);
                })
        }
        else {
            var err = new Error("comment not found in body");
            err.status = 404;
            return next(err);
        }
    })
    
    .delete(cors.corswithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch((err) => {
                next(err);
            })
        
    })
commentRouter.route('/:commentId')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .get(cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            }, (err) => next(err))
            .catch((err) => {
                next(err);
            })
    })
    .post(cors.corswithOptions, authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /comments/' + req.params.commentId);
    })
    .put(cors.corswithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    if (!comment.author.equals(req.user._id)) {
                        var err = new Error('You are not authorized to edit this comment!');
                        err.status = 403;
                        return next(err);
                    }
                    req.body.author = req.user._id;
                    Comments.findByIdAndUpdate(req.params.commentId, { $set: req.body }, { new: true })
                        .then((comment) => {
                            Comments.findById(comment._id)
                                .populate('author')
                                .then((comment) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(comment);
                                })
                        }, (err) => next(err))
                        .catch((err) => {
                            next(err);
                        })

                }
                else {
                    var err = new Error("comment not found");
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => {
                next(err);
            })
    })
    .delete(cors.corswithOptions, authenticate.verifyUser, (req, res, next) => {
        Comment.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    if (!comment.author.equals(req.user._id)) {
                        var err = new Error('You are not authorized to delete this comment!');
                        err.status = 403;
                        return next(err);
                    }
                    Comments.findByIdAndRemove(req.params.commentId)
                        .then((resp) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        },(err)=>next(err))
                        .catch((err) => {
                            next(err);
                        })
                }
                else {
                    var err = new Error("comment not found");
                    err.status = 404;
                    return next(err);
                }
            },(err)=>next(err))
            .catch((err) => {
                next(err);
            })
    })
module.exports = commentRouter;