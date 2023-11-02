const chai = require('chai');
const chaiHttp = require('chai-http');
const appInit = require('../app'); // Import your Express.js app
const expect = chai.expect;

chai.use(chaiHttp);

describe('CRUD Operations for Books', async () => {
  let bookId;
  let app;
  before( async () => {
    app = await appInit.appServer();
  });

  it('should create a new book', (done) => {
    chai
      .request(app)
      .post('/books')
      .send({
        id: 18390,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
        year_published: 2022,
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.equal('Test Book');
        bookId = res.body.id;
        done();
      });
  });

  it('should get a single book by ID', (done) => {
    chai
      .request(app)
      .get(`/books/${bookId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(bookId);
        done();
      });
  });

  it('should update a book by ID', (done) => {
    chai
      .request(app)
      .put(`/books/${bookId}`)
      .send({
        title: 'Updated Test Book',
        author: 'Updated Test Author',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.equal('Updated Test Book');
        done();
      });
  });

  it('should delete a book by ID', (done) => {
    chai
      .request(app)
      .delete(`/books/${bookId}`)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should get all books', (done) => {
    chai
      .request(app)
      .get('/books')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});
