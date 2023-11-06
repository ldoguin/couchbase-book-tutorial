// app.js
const express = require('express');
const couchbase = require('couchbase');
const config = require('./config');
const crypto = require('crypto');

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
        const query = `SELECT book.*, meta().id FROM ${bucket.name} as book`;
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
        let bookId = newBook.id;
        if (!bookId) {
          bookId = crypto.randomUUID();
        }
        const result = await collection.insert(bookId, newBook);
        const docInDB = await collection.get(bookId)
        docInDB.content.id = bookId;
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
        docInDB.content.id = bookId;
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

    app.use(express.static('public'));
    return app;
    
}

module.exports = {
  appServer
}