import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDTO } from 'src/auth/dto';
import { EditUserDTO } from 'src/user/dto';
import { CreateBookmarkDTO, EditBookmarkDTO } from 'src/bookmark/dto';

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

  describe('Bookmark', () => {
    // imagine user exp in e2e tests
    describe('get empty bookmarks', () => {
      it('should return all my bookmarks (none)', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.OK)
          .expectBody([])
      })
    })

    describe('create bookmark', () => {
      const dto: CreateBookmarkDTO = {
        title: 'My Bookmark',
        description: 'My Bookmark Description',
        link: 'https://www.google.com',
      }

      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link)
          .stores('bookmark_id', 'id')
      })
    })

    describe('get bookmarks', () => {
      it('should return all my bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
      })
    })

    describe('get bookmark by id', () => {
      it('should return a bookmark by id', () => {
        return pactum
          .spec()
          .get(`/bookmark/{id}`)
          .withPathParams({ 'id': '$S{bookmark_id}' })
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.OK)
      })
    })

    describe('edit bookmarks', () => {
      it('should edit a bookmark', () => {
        const dto: EditBookmarkDTO = {
          title: 'My Edited Bookmark',
          description: 'My Edited Bookmark Description',
          link: 'https://www2.google.com',
        }

        return pactum
          .spec()
          .patch(`/bookmark/{id}`)
          .withPathParams({ 'id': '$S{bookmark_id}' })
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link)
      })
    })

    describe('delete bookmarks', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete(`/bookmark/{id}`)
          .withPathParams({ 'id': '$S{bookmark_id}' })
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.NO_CONTENT)
      })

      it('should not find deleted bookmark', () => {
        return pactum
          .spec()
          .get(`/bookmark/{id}`)
          .withPathParams({ 'id': '$S{bookmark_id}' })
          .withHeaders({
            Authorization: `Bearer $S{access_token}`
          })
          .expectStatus(HttpStatus.NOT_FOUND)
          .expectBodyContains('Bookmark not found')
      })
    })

  })
})