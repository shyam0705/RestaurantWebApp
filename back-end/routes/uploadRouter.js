const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate.js');
var uploadRouter = express.Router();
const multer = require('multer');
var storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb("you can upload only jpeg,jpg,png,gif", null);
    }
    else {
        return cb(null, true);
    }
}
const cors = require('./cors.js');
const upload = multer({ storage: storage, fileFilter: imageFileFilter });
uploadRouter.route('/')
    .options(cors.corswithOptions, (req, res) => {
        res.statusCode = 200;
    })
    .put(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .get(cors.cors,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .delete(cors.corswithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("not valid operation");
    })
    .post(cors.corswithOptions,authenticate.verifyUser, upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })

module.exports = uploadRouter;