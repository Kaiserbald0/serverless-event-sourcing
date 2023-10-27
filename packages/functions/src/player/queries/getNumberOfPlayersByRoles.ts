// @todo Type Response
export async function main (): Promise<{
  statusCode: number
  body: any
}> {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: [{
        role: 'B',
        numberOfPlayers: '1'
      }, {
        id: 'uuid',
        numberOfPlayers: '3'
      }]
    })
  }
}
