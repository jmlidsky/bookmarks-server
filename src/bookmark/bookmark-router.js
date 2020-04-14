const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks} = require('../store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmark')
    .get((req, res) => {
        res
            .json(bookmarks);
    })

    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body;

        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!url) {
            logger.error(`Url is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!description) {
            logger.error(`Description is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!rating) {
            logger.error(`Rating is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        // get an id
        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmark/${id}`)
            .json(bookmark);
    })

bookmarkRouter
    .route('/bookmark/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        // make sure we found a bookmark
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Bookmark Not Found');
        }

        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(bi => bi.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter