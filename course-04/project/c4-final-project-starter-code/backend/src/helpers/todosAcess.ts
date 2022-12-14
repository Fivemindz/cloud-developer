import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
//const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION   
  ) {}
  
  async getTodosforUser(userId: string){
    const todos = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    return todos.Items
  }


  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: {
        ...todo
      }
    }).promise()
    return todo
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todo.userId,  
        todoId: todo.todoId
      },
      UpdateExpression: 'set done = :s',
      ExpressionAttributeValues: {':s': todo.done}
    }).promise()
    return todo
  }

  
  async deleteTodo(todoId: string, userId: string): Promise<string> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {  
        todoId: todoId,
        userId: userId
      }
    }).promise()
    return todoId
  }

  async getUploadUrl(imageId: string){
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }

  async updateUrl(todo: TodoItem): Promise<TodoItem> {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}`
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todo.userId,  
        todoId: todo.todoId
      },
      UpdateExpression: 'set attachmentUrl = :s',
      ExpressionAttributeValues: {':s': attachmentUrl}
    }).promise()
    return todo
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
