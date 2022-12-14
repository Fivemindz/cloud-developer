import { TodoAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getTodosForUser(userId: string){
  const todos = await todoAccess.getTodosforUser(userId)
  return todos
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = getUserId(event)
  const todo = {
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  }
  return await todoAccess.createTodo(todo)
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {

  const itemId = todoId
  const userId = getUserId(event)
  const todo = {
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done 
  }
  return await todoAccess.updateTodo(todo)
}

export async function deleteTodo(
  todoId: string,
  event: APIGatewayProxyEvent
): Promise<string> {
  const userId = getUserId(event)
  return await todoAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string
): Promise<string> {
  return todoAccess.getUploadUrl(todoId)  
}

export async function updateUrl(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {

  const itemId = todoId
  const userId = getUserId(event)
  const todo = {
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todoAccess.updateUrl(todo)
}

