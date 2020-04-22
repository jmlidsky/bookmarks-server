const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const BookmarksService = require('../bookmarks-service.js')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: bookmark.rating,
})

bookmarksRouter
    .route('/api/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(
            req.app.get('db')
        )
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next);
    })

    .post(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body;
        const newBookmark = { title, url, description, rating }
        const ratingNum = parseInt(rating)

        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({
                error: { message: `Rating must be a value of 1-5` }
            })
        }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

bookmarksRouter
    .route('/api/bookmarks/:id')
    .all((req, res, next) => {
        const { id } = req.params
        BookmarksService.getById(
            req.app.get('db'),
            id
        )
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`);
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.bookmark = bookmark // save the bookmark for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const { id } = req.params;
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            id
        )
            .then(() => {
                logger.info(`Bookmark with id ${id} deleted.`);
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const bookmarkToUpdate = { title, url, description, rating }
        const { id } = req.params

        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'url', 'description', or 'rating'`
                }
            })
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            id,
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter