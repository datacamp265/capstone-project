import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { getAllMoviesForUser } from '../../businessLogic/movies'

const logger = createLogger('get-movies')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Caller event', event)
    
    //const authorization = event.headers.Authorization
    //const split = authorization.split(' ')
    //const jwtToken = split[1]
    try {
    
        const userId = getUserId(event)
        
        const items = await getAllMoviesForUser(userId)
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                items
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