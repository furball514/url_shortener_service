const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  url: String,
  shortenedLink: String
},{timestamps: true});

const url = mongoose.model('url',urlSchema);
module.exports = url;