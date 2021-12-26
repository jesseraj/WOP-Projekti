'use strict';
const pool = require('../database/db');
const { httpError } = require('../utils/errors');
const promisePool = pool.promise();

const getAllMemes = async (next) => {
  try {
    // TODO: do the LEFT (or INNER) JOIN to get owner's name as ownername (from wop_user table).
    const [rows] = await promisePool.execute(`
	SELECT 
	*
	FROM wop_meme`);
    return rows;
  } catch (e) {
    console.error('getAllMemes error', e.message);
    next(httpError('Database error', 500));
  }
};

const getMeme = async (id, next) => {
  try {
    const [rows] = await promisePool.execute(
      `
	  SELECT 
	  meme_id, 
	  wop_meme.name, 
	  owner, 
	  filename,
	  birthdate, 
	  wop_user.name as ownername 
	  FROM wop_meme 
	  JOIN wop_user ON 
	  wop_meme.owner = wop_user.user_id
	  WHERE meme_id = ?`,
      [id]
    );
    return rows;
  } catch (e) {
    console.error('getMeme error', e.message);
    next(httpError('Database error', 500));
  }
};

const addMeme = async (
  name,
  description,
  owner,
  birthdate,
  filename,
  next
) => {
  try {
    const [rows] = await promisePool.execute(
      'INSERT INTO wop_meme (name, description, owner, filename, birthdate) VALUES (?, ?, ?, ?, ?)',
      [name, description, owner, filename, birthdate]
    );
    return rows;
  } catch (e) {
    console.error('addMeme error', e.message);
    next(httpError('Database error', 500));
  }
};

const modifyMeme = async (
  name,
  owner,
  birthdate,
  meme_id,
  role,
  next
) => {
  let sql =
    'UPDATE wop_meme SET name = ?, birthdate = ? WHERE meme_id = ? AND owner = ?;';
  let params = [name, birthdate, meme_id, owner];
  if (role === 0) {
    sql =
      'UPDATE wop_meme SET name = ?, birthdate = ?, owner = ? WHERE meme_id = ?;';
    params = [name, birthdate, owner, meme_id];
  }
  console.log('sql', sql);
  try {
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (e) {
    console.error('addMeme error', e.message);
    next(httpError('Database error', 500));
  }
};

const deleteMeme = async (id, owner_id, role, next) => {
  let sql = 'DELETE FROM wop_meme WHERE meme_id = ? AND owner = ?';
  let params = [id, owner_id];
  if (role === 0) {
    sql = 'DELETE FROM wop_meme WHERE meme_id = ?';
    params = [id];
  }
  try {
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (e) {
    console.error('getMeme error', e.message);
    next(httpError('Database error', 500));
  }
};

module.exports = {
  getAllMemes,
  getMeme,
  addMeme,
  modifyMeme,
  deleteMeme,
};
