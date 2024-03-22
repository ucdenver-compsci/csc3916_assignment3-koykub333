var mongoose = require('mongoose');
//const {MongoClient} = require('mongodb');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);
//const client = new MongoClient(process.env.DB);
//client.connect();


// Movie schema
var MovieSchema = new Schema({
  title: { type: String, required: true, index: true },
  releaseDate: Date,
  genre: {
    type: String,
    enum: [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'
    ],
  },
  actors: [{
    actorName: String,
    characterName: String,
  }],
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);