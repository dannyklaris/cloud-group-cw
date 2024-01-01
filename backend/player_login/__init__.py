import logging
import json
import os
from azure.functions import HttpRequest,HttpResponse
from azure.cosmos import CosmosClient


cosmos = CosmosClient.from_connection_string(os.environ['AzureCosmosDBConnectionString'])
database = cosmos.get_database_client(os.environ['Database'])
container = database.get_container_client(os.environ['PlayerContainer'])


def main(req: HttpRequest) -> HttpResponse:
    """Determine if player login details in request are valid"""

    # Log request
    loginRequest = req.get_json()
    logging.info(f'Player login request = {loginRequest}')

    # Extract username and password from request
    username = loginRequest.get('username')
    password = loginRequest.get('password')
    
    # Search for players that match request parameters
    playerSelectQuery = f"SELECT c.username FROM c WHERE c.username = '{username}' and c.password = '{password}'"
    matchingPlayers = list(container.query_items(playerSelectQuery, enable_cross_partition_query=True))
    
    if not matchingPlayers:
        # Query result is empty - the login details in the request are invalid
        return HttpResponse(
            body=json.dumps({"result": False, "msg": "Username or password incorrect"}),mimetype="application/json"
        )
    else:
        # A player exists that matches the login details in the request
        return HttpResponse(
            body=json.dumps({"result": True, "msg": "OK"}),mimetype="application/json"
        )
