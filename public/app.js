const bookList = document.getElementById('bookList');
const addButton = document.getElementById('addButton');
const bookDialog = document.getElementById('bookDialog');
const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const genreInput = document.getElementById('genreInput');
const yearInput = document.getElementById('yearInput');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');

let books = [];
let editingIndex = -1;

// Replace with the URL of your Express server
const apiBaseUrl = 'http://localhost:3000';

addButton.addEventListener('click', () => openDialog());
saveButton.addEventListener('click', () => saveBook());
cancelButton.addEventListener('click', () => closeDialog());

function openDialog() {
    bookDialog.style.display = 'block';
}

function closeDialog() {
    bookDialog.style.display = 'none';
    titleInput.value = '';
    authorInput.value = '';
    genreInput.value = '';
    yearInput.value = '';
}

function saveBook() {
    const title = titleInput.value;
    const author = authorInput.value;
    const genre = genreInput.value;
    const year = parseInt(yearInput.value);

    if (title && author && genre && !isNaN(year)) {
        const bookData = { title, author, genre, year };
        if (editingIndex === -1) {
            createBook(bookData)
                .then((book) => {
                    books.push(book);
                    renderBookList();
                    closeDialog();
                })
                .catch((error) => console.error('Error creating book:', error));
        } else {
            const bookId = books[editingIndex].id;
            updateBook(bookId, bookData)
                .then(() => {
                    books[editingIndex] = { id: bookId, ...bookData };
                    renderBookList();
                    closeDialog();
                    editingIndex = -1;
                })
                .catch((error) => console.error('Error updating book:', error));
        }
    }
}

function editBook(index) {
    editingIndex = index;
    const book = books[index];
    titleInput.value = book.title;
    authorInput.value = book.author;
    genreInput.value = book.genre;
    yearInput.value = book.year;
    openDialog();
}

function deleteBook(index) {
    const bookId = books[index].id;
    deleteBookById(bookId)
        .then(() => {
            books.splice(index, 1);
            renderBookList();
        })
        .catch((error) => console.error('Error deleting book:', error));
}

function renderBookList() {
    bookList.innerHTML = '';

    books.forEach((book, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'bg-white shadow-md rounded-lg p-4';

        const bookInfo = document.createElement('p');
        bookInfo.textContent = `Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Year: ${book.year}`;
        listItem.appendChild(bookInfo);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'bg-blue-500 text-white rounded p-2 hover:bg-blue-600 mr-2';
        editButton.addEventListener('click', () => editBook(index));
        listItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'bg-red-500 text-white rounded p-2 hover:bg-red-600';
        deleteButton.addEventListener('click', () => deleteBook(index));
        listItem.appendChild(deleteButton);

        bookList.appendChild(listItem);
    });
}

function createBook(bookData) {
    return fetch(`${apiBaseUrl}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}

function updateBook(bookId, bookData) {
    return fetch(`${apiBaseUrl}/books/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}

function deleteBookById(bookId) {
    return fetch(`${apiBaseUrl}/books/${bookId}`, {
        method: 'DELETE',
    })
        .catch((error) => {
            throw error;
        });
}

// Load books from the server when the page loads
fetchBooks();

function fetchBooks() {
    fetch(`${apiBaseUrl}/books`)
        .then((response) => response.json())
        .then((data) => {
            books = data;
            renderBookList();
        })
        .catch((error) => console.error('Error fetching books:', error));
}
