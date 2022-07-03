import { Test, TestingModule } from '@nestjs/testing';
// import { HttpModule, HttpService } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { BooksService } from './books.service';
// import { Book } from './book.entity';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/entity/User';
import { createTestConfiguration } from './db';

describe('User Services', () => {
  let module: TestingModule;
  let service: UsersService;
  // let httpService: HttpService;
  let repository: Repository<User>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(createTestConfiguration([User])),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService]
    }).compile();

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  });

  afterAll(() => {
    module.close();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // // Assert if setTimeout was called properly
  // it('delays the greeting by 2 seconds', () => {
  //   expect(setTimeout).toHaveBeenCalledTimes(1);
  //   expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), Delays.Long);
  // });

  // // Assert greeter result
  // it('greets a user with `Hello, {name}` message', () => {
  //   expect(hello).toBe(`Hello, ${name}`);
  // });
});
