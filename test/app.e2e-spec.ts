import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDTO } from 'src/auth/dto';
import { EditUserDTO } from 'src/user/dto';

const TEST_PORT = 3010
const HOST = `http://localhost:${TEST_PORT}`

describe('app e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  // setup
  beforeAll(async () => {
    // compiles our module and resolves all the dependencies
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile()

    // creates an instance of the NestApplication class
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // strip away any properties that do not have any decorators
      }))

    await app.init()
    await app.listen(TEST_PORT)

    // since we're running tests with watch flag, we need to clean up the database
    // when we run the tests again, but how could we do so if the script that
    // recreates the db takes a long time? like this:
    prisma = app.get(PrismaService)
    await prisma.cleanDb()

    // pactum http request
    pactum.request.setBaseUrl(HOST)
  })

  // tear down
  afterAll(() => {
    app.close()
  })

  // Tests

  describe('Auth', () => {
    const dto: AuthDTO = {
      username: 'email@example.com',
      password: 'password'
    }

    describe('signup', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
        // .inspect() // logs request & response
      })
      it('should throw exception if username empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
        // .inspect() // logs request & response
      })
      it('should throw exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            username: dto.username
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
      })
      it('should throw exception if no body', () => {
        return pactum
          .spec()
          .post(
            `${HOST}/auth/signup`
          )
          .expectStatus(HttpStatus.BAD_REQUEST)
      })
    })

    describe('signin', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('access_token', 'access_token')
      })
      it('should throw exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            username: dto.username
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
      })
      it('should throw exception if no body', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .expectStatus(HttpStatus.BAD_REQUEST)
      })
    })

  })

  describe('User', () => {
    describe('get me', () => {
      it('should return my user data', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            // pactum have this special syntax for storing and retrieving values in store
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.OK)
      })
      it('should return 401', () => {
        return pactum
          .spec()
          .get('/users/me')
          .expectStatus(HttpStatus.UNAUTHORIZED)
      })
    })

    describe('edit user', () => {
      it('should edit my user data', () => {
        const dto: EditUserDTO = {
          firstName: 'Fausto',
          username: 'fausto@lindo.com'
        }

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          // check response body
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.username)
      })
    })

  })

  // describe('Bookmark', () => {
  //   describe('create bookmark', () => {
  //     it.todo(
  //       'should create a bookmark'
  //     )
  //   })

  //   describe('get bookmarks', () => {
  //     it.todo(
  //       'should return all my bookmarks'
  //     )
  //   })

  //   describe('get bookmark by id', () => {
  //     it.todo(
  //       'should return a bookmark by id'
  //     )
  //   })

  //   describe('edit bookmarks', () => {
  //     it.todo(
  //       'should edit a bookmark'
  //     )
  //   })

  //   describe('delete bookmarks', () => {
  //     it.todo(
  //       'should delete a bookmark'
  //     )
  //   })

  // })
})