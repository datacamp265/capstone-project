import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { MovieItem } from '../models/MovieItem'
import { UpdateMovieRequest } from '../requests/UpdateMovieRequest'
import { CreateMovieRequest } from '../requests/CreateMovieRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('movie-access')

export class MovieAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly movieTable = process.env.TODO_TABLE,
    private readonly bucketName = process.env.TODO_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.TODO_TABLE_IDX)
    { //
  }

  async getAllMoviesByUser(userId: string): Promise<MovieItem[]> {
    logger.info('Getting all todo items by user')

    const result = await this.docClient.query({
      TableName: this.movieTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items 
    return items as MovieItem[]
  }
  
  async updateMovie(updateMovie: UpdateMovieRequest, userId: string, movieId: string) {
    logger.info('Updating a movie with ID ${movie.movieId}')
    
    const updateExpression = 'set #t = :title, done = :done' /*dueDate = :dueDate,*/

    const result = await this.docClient.update({
      TableName: this.movieTable,
      Key: {
          userId: userId,
          movieId: movieId
      },
      UpdateExpression: updateExpression,
      ConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':title': updateMovie.title,
       // ':dueDate': updateMovie.dueDate,
        ':done': updateMovie.done,
        ':todoId': movieId
      },
      ExpressionAttributeNames: {
        '#t': 'title'
      },
      ReturnValues: 'UPDATED_NEW'
      }).promise()
    
    logger.info('Update Item succeed', {
      result
    })
  }

  async createMovie(createMovie: CreateMovieRequest, userId: string, movieId: string): Promise<MovieItem> {
    logger.info('Creating a todo with ID ${todoId}')
    
    const newItem = {
      title: createMovie.title,
     // dueDate: createMovie.dueDate,
      createdAt: new Date().toISOString(),
      userId: userId,
      movieId: movieId,
      done: false
    }
    
    await this.docClient.put({
      TableName: this.movieTable,
      Item: newItem
    }).promise()

    return newItem
  }


  async deleteMovie(userId: string, movieId: string)/*: Promise<string>*/ {
    logger.info('Deleting a movie with ID ${movie.movieId}')
    
    await this.docClient.delete({
      TableName: this.movieTable,
      Key: {
        userId,
        movieId
      },
      ConditionExpression: 'movieId = :movieId',
      ExpressionAttributeValues: {
        ':movieId': movieId
      }
    }).promise()
    
    //return userId
  }

  async getUploadUrl(movieId: string): Promise<string> {
    logger.info('Generating upload Url')
    
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: movieId,
      Expires: this.urlExpiration
    })
  }
  
  async updateAttachmentUrl(userId: string, movieId: string) {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${movieId}`
    
      await this.docClient.update({
        TableName: this.movieTable,
        Key: {
          userId: userId,
          movieId: movieId
        },
        UpdateExpression: 'set attachmentUrl = :au',
        ExpressionAttributeValues: {
          ':au': attachmentUrl
        }
       // ReturnValues: 'UPDATED_NEW'
      }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
  
