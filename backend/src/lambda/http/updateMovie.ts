import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { UpdateMovieRequest } from '../../requests/UpdateMovieRequest'
import { updateMovieItem } from '../../businessLogic/movies'

const logger = createLogger('update-todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
 
  try {
    
    
    const updatedMovie: UpdateMovieRequest = JSON.parse(event.body)
    
    //const authorization = event.headers.Authorization
    //const split = authorization.split(' ')
    //const jwtToken = split[1]
  
    const userId = getUserId(event)
    const movieId = event.pathParameters.movieId
    
    const updatedItem = await updateMovieItem(updatedMovie, userId, movieId)
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        updatedItem
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
