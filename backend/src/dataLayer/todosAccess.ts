import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todo-access')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly bucketName = process.env.TODO_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.TODO_TABLE_IDX)
    { //
  }

  async getAllTodosByUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items by user')

    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items 
    return items as TodoItem[]
  }
  
  async updateTodo(updateTodo: UpdateTodoRequest, userId: string, todoId: string) {
    logger.info('Updating a todo with ID ${todo.todoId}')
    
    const updateExpression = 'set #n = :name, dueDate = :dueDate, done = :done'

    const result = await this.docClient.update({
      TableName: this.todoTable,
      Key: {
          userId: userId,
          todoId: todoId
      },
      UpdateExpression: updateExpression,
      ConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':name': updateTodo.name,
        ':dueDate': updateTodo.dueDate,
        ':done': updateTodo.done,
        ':todoId': todoId
      },
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
      }).promise()
    
    logger.info('Update Item succeed', {
      result
    })
  }

  async createTodo(createTodo: CreateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Creating a todo with ID ${todoId}')
    
    const newItem = {
      name: createTodo.name,
      dueDate: createTodo.dueDate,
      createdAt: new Date().toISOString(),
      userId: userId,
      todoId: todoId,
      done: false
    }
    
    await this.docClient.put({
      TableName: this.todoTable,
      Item: newItem
    }).promise()

    return newItem
  }


  async deleteTodo(userId: string, todoId: string)/*: Promise<string>*/ {
    logger.info('Deleting a todo with ID ${todo.todoId}')
    
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId
      },
      ConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()
    
    //return userId
  }

  async getUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating upload Url')
    
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
  
  async updateAttachmentUrl(userId: string, todoId: string) {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    
      await this.docClient.update({
        TableName: this.todoTable,
        Key: {
          userId: userId,
          todoId: todoId
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
  
