const bookController = require('../../../controllers/book');
const Book = require('../../../models/book');

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockStatus = jest.fn(code => ({ send: mockSend, json: mockJson, end: jest.fn() }));
const mockRes = { status: mockStatus };

describe('book controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('index', () => {
    it('returns a 200 status code', async () => {
      const testBooks = ['book1', 'book2'];

      jest.spyOn(Book, 'getAll').mockResolvedValue(testBooks);

      await bookController.index(null, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(testBooks);
    });

    it('calls Book.getAll', async () => {
        const testBooks = ['book1', 'book2'];
  
        jest.spyOn(Book, 'getAll')
          .mockResolvedValue(testBooks)
  
        await bookController.index(null, mockRes)
        expect(Book.getAll).toHaveBeenCalledTimes(1)
    })
    
    it('rejects', async () => {
      jest.spyOn(bookController, 'index')
        .mockRejectedValue(new Error('Something happened to your db'))

      try {
        await bookController.index('', mockRes)
      } catch (error) {
        expect(error).toBeTruthy()
        expect(error.message).toBe('Something happened to your db')
      }
    })


  });
});