'use strict';
// memeRoute
const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ dest: './uploads/', fileFilter });
const {
  meme_list_get,
  meme_get,
  meme_post,
  meme_put,
  meme_delete,
} = require('../controllers/memeController');
const router = express.Router();

router
  .route('/')
  .get(meme_list_get)
  .post(
    upload.single('meme'),
    body('name').notEmpty().escape(),
    body('description').notEmpty().escape(),
    body('birthdate').isNumeric(),

    meme_post
  );

router
  .route('/:id')
  .get(meme_get)
  .delete(meme_delete)
  .put(
    body('name').notEmpty().escape(),
    body('description').notEmpty().escape(),
    body('birthdate').isNumeric(),
    meme_put
  );

module.exports = router;
