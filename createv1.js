import uuid from "uuid";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 *
 *
 * @export
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export function main(event, context, callback) {
    //Request body is passed in as JSON encoded string in 'event.body'
    const data = JSON.parse(event.body);

    const params = {
        TableName: process.env.tableName,
        /*
         * 'Item' contains the attributes of the item to be created
         * - 'userId': user identities are federated through cognito identity pool. We will use the identity id as the user id of the authenticated user
         * - 'nodeId': a unique uuid
         * - 'content': parsed from request body
         * - 'attachment': parsed from request body
         * - 'createdAt': current Unix timestamp
         */
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            noteId: uuid.v1(),
            content: data.content,
            attachment: data.attachment,
            createAt: Date.now()
        }
    };

    dynamoDb.put(params, (error, data) => {
        // Set the response headers to enabls CORS (Cross-origin resource sharing)

        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        };

        //return status code 500 on error
        if (error) {
            const response = {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({
                    status: false
                })
            };
            callback(null, response);
            return;
        }

        // Return status code 200 and the newly created item
        const response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
}