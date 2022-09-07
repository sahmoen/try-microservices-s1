import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookDto } from './dto/create-books-dto';
import { FilterBookDto } from './dto/filter-book-dto';
import { UpdateBookDto } from './dto/update-book-dto';
import { Book } from './entity/book.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookRepository } from './repository/book.repository';

@Injectable()
export class BooksService {
  // constructor(
  //   @InjectRepository(BookRepository)
  //   private bookRepository: BookRepository,
  // ) {}
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  // @MessagePattern('my-first-topic') // Our topic name
  // async getHello(@Payload() message: any) {
  //   console.log(message);
  //   return 'Berhasil';
  // }

  async getBooks(filter: FilterBookDto): Promise<Book[]> {
    const { title, author, category, min_year, max_year } = filter;
    if (title) {
      return this.bookRepository
        .createQueryBuilder()
        .select('book')
        .from(Book, 'book')
        .where('lower(book.title) LIKE :title', {
          title: `%${title.toLowerCase()}%`,
        })
        .getMany();
    } else if (author) {
      return this.bookRepository
        .createQueryBuilder()
        .select('book')
        .from(Book, 'book')
        .where('lower(book.author) LIKE :author', {
          author: `%${author.toLowerCase()}%`,
        })
        .getMany();
    } else if (category) {
      return this.bookRepository
        .createQueryBuilder()
        .select('book')
        .from(Book, 'book')
        .where('lower(book.category) LIKE :category', {
          category: `%${category.toLowerCase()}%`,
        })
        .getMany();
    } else if (min_year) {
      return this.bookRepository
        .createQueryBuilder()
        .select('book')
        .from(Book, 'book')
        .where('book.year >= :min_year', { min_year })
        .getMany();
    } else if (max_year) {
      return this.bookRepository
        .createQueryBuilder()
        .select('book')
        .from(Book, 'book')
        .where('book.year <= :max_year', { max_year })
        .getMany();
    } else {
      return await this.bookRepository.find();
    }
  }

  // @MessagePattern('my-first-topic')
  async getOneBook(id: string, message: any): Promise<Book[]> {
    try {
      const book = await this.bookRepository.find({
        where: {
          id: id,
        },
      });
      console.log(message);

      return book;
    } catch (err) {
      console.log(err);

      throw new NotFoundException(`Book with id-${id} is not found`);
    }
  }

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const newBook = this.bookRepository.create(createBookDto);
    // const newBook = this.bookRepository.insert(createBookDto);

    return this.bookRepository.save(newBook);
  }

  // async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book[]> {
  //   const { title, author, category, year } = updateBookDto;
  //   const findBookById = await this.getOneBook(id);
  //   findBookById[0].title = title;
  //   findBookById[0].author = author;
  //   findBookById[0].category = category;
  //   findBookById[0].year = year;
  //   return this.bookRepository.save(findBookById);
  // }

  // async deleteBook(id: string): Promise<Book[]> {
  //   const findBookById = await this.getOneBook(id);

  //   return this.bookRepository.remove(findBookById);
  // }
}
