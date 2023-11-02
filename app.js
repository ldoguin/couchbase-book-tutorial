// app.js
const express = require('express');
const couchbase = require('couchbase');
const config = require('./config');

const appServer = async() => {
  const app = express();

  // Connect to Couchbase Capella
  const connectOptions = {
    username: config.cluster.username,
    password: config.cluster.password,
    // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
    // when accessing Capella from a different Wide Area Network
    // or Availability Zone (e.g. your laptop).
    configProfile: 'wanDevelopment'
  }

  const cluster = await couchbase.connect(config.cluster.connectionString, connectOptions)

  const bucket = cluster.bucket('default'); // Replace with your Couchbase Capella bucket name
  const collection = bucket.defaultCollection();

  app.use(express.json());

  // Route to get all books
  app.get('/books', async (req, res) => {
      try {
        const query = `SELECT * FROM ${bucket.name}`;
        const result = await cluster.query(query);
        const books = result.rows;
        res.json(books);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching books' });
      }
    });
    
    // Route to get a single book by ID
    app.get('/books/:id', async (req, res) => {
      const bookId = req.params.id;
      try {
        const result = await collection.get(bookId);
        res.json(result.content);
      } catch (error) {
        console.error(error);
        if (error instanceof couchbase.DocumentNotFoundError) {
          res.status(404).json({ error: 'Book not found' });
        } else {
          res.status(500).json({error: 'Something went wrong'});
        }
      }
    });
    
    // Route to create a new book
    app.post('/books', async (req, res) => {
      const newBook = req.body;
      try {
        const result = await collection.insert(newBook.id, newBook);
        const docInDB = await collection.get(newBook.id)
        res.status(201).json(docInDB.content);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create a new book' });
      }
    });
    
    // Route to update a book by ID
    app.put('/books/:id', async (req, res) => {
      const bookId = req.params.id;
      const updatedBook = req.body;
    
      try {
        const result = await collection.replace(bookId, updatedBook);
        const docInDB = await collection.get(bookId)
        res.json(docInDB.content);
      } catch (error) {
        console.error(error);
        if (error instanceof couchbase.DocumentNotFoundError) {
          res.status(404).json({ error: 'Book not found' });
        } else {
          res.status(500).json({error: 'Something went wrong'});
        }
      }
    });
    
    // Route to delete a book by ID
    app.delete('/books/:id', async (req, res) => {
      const bookId = req.params.id;
    
      try {
        await collection.remove(bookId);
        res.status(204).send();
      } catch (error) {
        console.error(error);
        if (error instanceof couchbase.DocumentNotFoundError) {
          res.status(404).json({ error: 'Book not found' });
        } else {
          res.status(500).json({error: 'Something went wrong'});
        }
      }
    });

    return app;
    
}

module.exports = {
  appServer
}