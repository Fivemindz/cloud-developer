
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJEcagJCpWdtjKMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFGRldi1hc3QudXMuYXV0aDAuY29tMB4XDTIwMDkxOTE0MzgyNVoXDTM0MDUy
OTE0MzgyNVowHzEdMBsGA1UEAxMUZGV2LWFzdC51cy5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDDAXPXUxgx79aodE+OoBGxNlUA5bM4
wCxHbi6GRH035Xbm2vdv/mGbCKegVdsuEpK/kjDCuCd0VLzj9hFMZ4qHXMLR+HE8
2XcS3uYImR2loI8H18pJokt+O48ftwsUP7ujkQc7XUXlJakof9eurcXUhvlToyR6
HladCjdQ8jVK/voN7Wx6ymx//IybnIDMCglv6bm/zcjdW0E0V6XyoqtdzmnsOr9r
0fIIJNxNWiYd+bnrJrVMdo8Ie+eSmvdfUjpV2tYe+OYiTcWLOXjIRmbaA75TaIek
klP8YV/T5zFFIP7dCtOzONqnac9wJbv9d9JipOa/bhd2Zl0wsm82R3d1AgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFIln1vUae13wmkAM0wc2qSFS
9Ua8MA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAIObD32JUpw6x
iGy11GAmELRCYNoWbX8DmIcrZX072uB4zAJBkRdsWZWLGDVcKD6OLZd6jgHzpOWK
USctAyZnurIVJw17dYb9+iH9OLqu/6ux3Pi2pWyo6rShZSwfzFEZJ+1nmmC1smDL
2KaAtdpHvSXn1JJIgE6PlxtYKzvKVnOqTyDrYy5tBKjorZsz7ZcicZPRHSTUByso
1s0qaIbsslqjlDJlzgSZpZT6aeVDSKVirdRiOUp90Pw7cay03dHlzo+G4IyYH4r1
OMmW7uuFS7CwGGP32JgVMkhNuiiase6g3uNu0nyu44T5fAKeI5/TqpPs7k7pQUQp
c9V7ZvBxnQ==
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }

  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}