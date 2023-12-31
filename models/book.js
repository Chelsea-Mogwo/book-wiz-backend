const db = require('../database/connect')

class Book {

    constructor ({ book_id, book_name, book_year, book_author, book_genre, book_description, book_image}) {
        this.id = book_id;
        this.name = book_name;
        this.year = book_year;
        this.author = book_author;
        this.genre = book_genre;
        this.description = book_description;
        this.image = book_image;
    }


    static async getAll() {
        const response = await db.query("SELECT books.* FROM books LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id WHERE borrowed_books.book_id IS NULL;")
        if (response.rows.length === 0) {
            throw new Error("No books available.")
        }
        return response.rows.map(g => new Book(g))
    }


    static async getOneById(id) {
        const response = await db.query("SELECT books.* FROM books LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id WHERE books.book_id = $1 AND borrowed_books.book_id IS NULL", [id]);
        if (response.rows.length != 1) {
            throw new Error("Unable to locate book.")
        }
        return new Book(response.rows[0]);
    }


    static async create(data) {
        const { name: book_name, author: book_author, year: book_year, genre: book_genre, description: book_description} = data;
    
        const response = await db.query('INSERT INTO books (book_name, book_author, book_year, book_genre, book_description) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [book_name, book_author, book_year, book_genre, book_description]);
    
        return new Book(response.rows[0]);
    }


    async update(data) {
        const { name: book_name, author: book_author, year: book_year, genre: book_genre, description: book_description} = data;
        const response = await db.query("UPDATE books SET book_name = $1, book_author = $2, book_year = $3, book_genre = $4, book_description = $5 WHERE book_id = $6 RETURNING *;", [book_name, book_author, book_year, book_genre, book_description, this.id])

        if (response.rows.length != 1) {
            throw new Error("Unable to update book.")
        }

        return new Book(response.rows[0]);
    }


    async deleteById() {
        try {
            await db.query("DELETE FROM books WHERE book_id = $1", [this.id]);
            return { success: true, message: 'book deleted successfully.'} 
        } catch (error) {
            throw new Error('This id does not match an entry.')
        }
    }


    static async getByGenre(keyword) {

        const response = await db.query("SELECT books.* FROM books LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id WHERE books.book_genre ILIKE $1 AND borrowed_books.book_id IS NULL;", [`%${keyword}%`]);
    
        if (response.rows.length === 0) {
            throw new Error("No books found with that genre.")
        }
    
        const results = response.rows.map(row => new Book(row));
        return results;
    }


    static async getByTitleOrAuthor(keyword) {
        const response = await db.query(`
            SELECT books.* FROM books LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id WHERE (books.book_name ILIKE $1 OR books.book_author ILIKE $1) AND borrowed_books.book_id IS NULL`, [`%${keyword}%`]);
        
        if (response.rows.length === 0) {
            throw new Error("No books found with that title or author, or all matching books are borrowed.")
        }
        
        const results = response.rows.map(row => new Book(row));
        return results;
    }
    
    static async getRandom() {
        console.log("getRandom");
    
        const response = await db.query(`
            SELECT books.* FROM books LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id 
            WHERE borrowed_books.book_id IS NULL ORDER BY RANDOM() LIMIT 1;
        `);
        
        console.log(response);
        
        if (response.rows.length === 0) {
            throw new Error("No books available or all books are borrowed.");
        }
        
        return new Book(response.rows[0]);
    }
}



module.exports = Book;
