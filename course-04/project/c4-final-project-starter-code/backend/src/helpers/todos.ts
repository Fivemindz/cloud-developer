// import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
export function todoBuilder(
  todoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
  ){
  const itemId = uuid.v4()
  const todo = {
    todoId: itemId,
    userId: getUserId(event),
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: "http://example.com/image.png",
    ...todoRequest
  }
    return todo  
}