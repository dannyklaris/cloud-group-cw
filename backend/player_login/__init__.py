import logging
import json
from azure.functions import HttpRequest,HttpResponse
import os
from azure.cosmos import CosmosClient
cosmos = CosmosClient.from_connection_string(os.environ['AzureCosmosDBConnectionString'])
database = cosmos.get_database_client(os.environ['Database'])
container = database.get_container_client(os.environ['PlayerContainer'])



def main(req: HttpRequest) -> HttpResponse:
        loginPlayer = req.get_json()
        username = loginPlayer.get('username')
        password = loginPlayer.get('password')
        
        logging.info('login player by parameter {}'.format(loginPlayer))
        
        playerlist = f"SELECT * FROM c WHERE c.username = '{username}'"
        usernamelist = list(container.query_items(playerlist, enable_cross_partition_query=True))
        
        # If usernamelist is empty, it means that the entered username does not exist
        if not usernamelist:
            return HttpResponse(
                body=json.dumps({"result": False, "msg": "Username or password incorrect"}),mimetype="application/json"
            )
            
        # There will only be one person in the usernamelist, so there will only be one password. If the password does not match, it will prove that the login failed.
        elif usernamelist[0]['password'] != password:
            return HttpResponse(
                body=json.dumps({"result": False, "msg": "Username or password incorrect"}),mimetype="application/json"
            )
        
        # If both username and password are correct, then ok.
        else:
            return HttpResponse(
                body=json.dumps({"result": True, "msg": "OK"}),mimetype="application/json"
            )