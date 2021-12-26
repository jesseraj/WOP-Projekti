'use strict';
const { validationResult } = require('express-validator');
// memeController
const {
  getAllMemes,
  getMeme,
  addMeme,
  modifyMeme,
  deleteMeme,
} = require('../models/memeModel');
const { httpError } = require('../utils/errors');
const { makeThumbnail } = require('../utils/resize');

const meme_list_get = async (req, res, next) => {
  try {
    const memes = await getAllMemes(next);
    if (memes.length > 0) {
      res.json(memes);
    } else {
      next('No memes found', 404);
    }
  } catch (e) {
    console.log('meme_list_get error', e.message);
    next(httpError('internal server error', 500));
  }
};

const meme_get = async (req, res, next) => {
  try {
    const vastaus = await getMeme(req.params.id, next);
    if (vastaus.length > 0) {
      res.json(vastaus.pop());
    } else {
      next(httpError('No meme found', 404));
    }
  } catch (e) {
    console.log('meme_get error', e.message);
    next(httpError('internal server error', 500));
  }
};

const meme_post = async (req, res, next) => {
  console.log('meme_post', req.body, req.file, req.user);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('meme_post validation', errors.array());
    next(httpError('invalid data', 400));
    return;
  }

  if (!req.file) {
    const err = httpError('file not valid', 400);
    next(err);
    return;
  }



  try {
    const thumb = await makeThumbnail(
      req.file.path,
      './thumbnails/' + req.file.filename
    );

    const { name, description, birthdate } = req.body;

    const tulos = await addMeme(
      name,
      description,
      req.user.user_id,
      birthdate,
      req.file.filename,
      next
    );
    if (thumb) {
      if (tulos.affectedRows > 0) {
        res.json({
          message: 'meme added',
          meme_id: tulos.insertId,
        });
      } else {
        next(httpError('No meme inserted', 400));
      }
    }
  } catch (e) {
    console.log('meme_post error', e.message);
    next(httpError('internal server error', 500));
  }
};

const meme_put = async (req, res, next) => {
  console.log('meme_put', req.body, req.params);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('meme_put validation', errors.array());
    next(httpError('invalid data', 400));
    return;
  }
  // pvm VVVV-KK-PP esim 2010-05-28
  try {
    const { name, birthdate } = req.body;
    /*let owner = req.user.user_id;
    if (req.user.role === 0) {
      owner = req.body.owner;
    }*/

    const owner = req.user.role === 0 ? req.body.owner : req.user.user_id;

    const tulos = await modifyMeme(
      name,
      owner,
      birthdate,
      req.params.id,
      req.user.role,
      next
    );
    if (tulos.affectedRows > 0) {
      res.json({
        message: 'meme modified',
        meme_id: tulos.insertId,
      });
    } else {
      next(httpError('No meme modified', 400));
    }
  } catch (e) {
    console.log('meme_put error', e.message);
    next(httpError('internal server error', 500));
  }
};

const meme_delete = async (req, res, next) => {
  try {
    const vastaus = await deleteMeme(
      req.params.id,
      req.user.user_id,
      req.user.role,
      next
    );
    if (vastaus.affectedRows > 0) {
      res.json({
        message: 'meme deleted',
        meme_id: vastaus.insertId,
      });
    } else {
      next(httpError('No meme found', 404));
    }
  } catch (e) {
    console.log('meme_delete error', e.message);
    next(httpError('internal server error', 500));
  }
};

module.exports = {
  meme_list_get,
  meme_get,
  meme_post,
  meme_put,
  meme_delete,
};
