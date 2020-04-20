const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const BookmarksService = require('../bookmarks-service.js')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: bookmark.rating,
})

bookmarkRouter
    .route('/bookmark')
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

        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res.status(201)
                    .location(`/bookmark/${bookmark.id}`)
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

bookmarkRouter
    .route('/bookmark/:id')
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

module.exports = bookmarkRouter