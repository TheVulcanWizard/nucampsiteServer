const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //Naming convention should be changed, as 'favorite' & 'favorites' gets confusing
    //This implementation seems clunky since we are repeating ourselves quite a bit.
        //Maybe if we checked for nonexistent doc first, we could cut down on repetition.
    Favorite.findOne({ user: req.user._id})
    .then(favorites => {
        if (favorites) {
            req.body.forEach(favorite => {
                if (!favorites.campsites.includes(favorite._id)) {
                    favorites.campsites.push(favorite._id)
                }
            })
            favorites.save()
            .then(favorite => {
                console.log('Favorites added!', favorite)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
        } else {
            Favorite.create({
                user: req.user._id
            })
            .then(favorites => {
                req.body.forEach(favorite => {
                    if (!favorites.campsites.includes(favorite._id)) {
                        favorites.campsites.push(favorite._id)
                    }
                })
                favorites.save()
                .then(favorite => {
                    console.log('Favorites added!', favorite)
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
            })
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /favorites`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(favorite => {
        res.statusCode = 200
        if (favorite) {
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete.')
        }
    })
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id})
    .then(favorites => {
        if (favorites) {
            if (!favorites.campsites.includes(req.params.campsiteId)) {
                favorites.campsites.push(req.params.campsiteId)
                favorites.save()
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
            } else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/plain')
                res.end('That campsite is already in your list of favorites')
            }  
        } else {
            Favorite.create({
                user: req.user._id
            })
            .then(favorites => {
                favorites.campsites.push(req.params.campsiteId)
                favorites.save()
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
            })
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id})
    .then(favorites => {
        if (favorites) {
            if (favorites.campsites.includes(req.params.campsiteId)) {
                const campsiteIndex = favorites.campsites.indexOf(req.params.campsiteId)
                if (campsiteIndex >= 0) {
                    favorites.campsites.splice(favorites.campsites.indexOf(campsiteIndex, 1))
                }
                favorites.save()
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
            } else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/plain')
                res.end(`Campsite not found in favorites with an Id of ${req.params.campsiteId}`)
            }
        } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete.')
        }
    })
})

module.exports = favoriteRouter