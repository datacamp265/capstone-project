import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { CreateMovieRequest } from '../../requests/CreateMovieRequest'
import { createMovieItem } from '../../businessLogic/movies'

const logger = createLogger('create-movie')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try {
    const newMovie: CreateMovieRequest = JSON.parse(event.body)
    /*const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]*/
  
    const userId = getUserId(event)
    
    const item = await createMovieItem(newMovie, userId)
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item
      })
    }
  } catch (e) {
    logger.error('Error: ' + e.message)
    
    return {
      statusCode: 500,
      body: e.message
    }
  }
}