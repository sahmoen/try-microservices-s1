import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Client, ClientKafka, Transport } from '@nestjs/microservices';

import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-books-dto';
import { FilterBookDto } from './dto/filter-book-dto';
import { UpdateBookDto } from './dto/update-book-dto';
import { Book } from './entity/book.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'kafkaSample',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'my-kafka2-consumer',
      },
    },
  })
  client: ClientKafka;

  async onModuleInit() {
    // Need to subscribe to topic
    // so that we can get the response from kafka microservice
    this.client.subscribeToResponseOf('my-second-topic');
    await this.client.connect();
  }

  // @MessagePattern('my-first-topic') // Our topic name
  // async getHello(@Payload() message: any) {
  //   console.log(message);
  //   return message;
  // }

  @Get('/kafka')
  getHello2() {
    return this.client.send('my-second-topic', 'Hello Kafka'); // args - topic, message
  }

  @Get()
  getBooks(@Query() filter: FilterBookDto) {
    return this.booksService.getBooks(filter);
  }
  // @Get()
  // getBooks() {
  //   return this.booksService.getBooks();
  // }

  @MessagePattern('my-first-topic')
  @Get('/:id')
  getBookById(
    @Param('id') id: string,
    @Payload() message: any,
  ): Promise<Book[]> {
    console.log(message);

    return this.booksService.getOneBook(id, message);
  }

  @Post()
  // @UsePipes(ValidationPipe)
  async createBook(@Body() payload: CreateBookDto): Promise<Book> {
    console.log(payload);

    return this.booksService.createBook(payload);
  }

  // @Put('/:id')
  // updateBook(@Param('id') id: string, @Body() payload: UpdateBookDto) {
  //   return this.booksService.updateBook(id, payload);
  // }

  // @Delete('/:id')
  // deleteBook(@Param('id') id: string) {
  //   return this.booksService.deleteBook(id);
  // }
}
