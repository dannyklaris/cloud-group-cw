import logging
import json

from azure.functions import HttpRequest, HttpResponse

import os
from azure.cosmos import CosmosClient
from azure.cosmos.exceptions import CosmosHttpResponseError, CosmosResourceExistsError, CosmosResourceNotFoundError

MyCosmos = CosmosClient.from_connection_string(os.environ['AzureCosmosDBConnectionString'])
DBProxy = MyCosmos.get_database_client(os.environ['Database'])
PlayerProxy = DBProxy.get_container_client(os.environ['PlayerContainer'])

def main(req: HttpRequest) -> HttpResponse:
    
    req_body = req.get_json()
    logging.info('Registering new player: {}'.format(req_body))
    
    new_player = { "username" : req_body['username'], "password" : req_body['password']}
    
    # check if player exists
    query = f'SELECT * FROM c WHERE c.username = "{new_player["username"]}"'
    existing_players = list(PlayerProxy.query_items(query, enable_cross_partition_query=True))
    logging.info('Existing players: {}'.format(existing_players))
    if existing_players:
        return HttpResponse(body=json.dumps({"result": False, "msg" : "Username already exists"}), mimetype="application/json")
    
    # username too long or too short
    if len(new_player["username"]) < 4 or len(new_player["username"]) > 14:
        return HttpResponse(body=json.dumps({"result": False, "msg" : "Username less than 4 characters or more than 14 characters"}), mimetype="application/json")
    
    # password too long or too short
    if len(new_player["password"]) < 6 or len(new_player["password"]) > 20:
        return HttpResponse(body=json.dumps({"result": False, "msg" : "Password less than 6 characters or more than 20 characters"}), mimetype="application/json")
    
    # valid player
    PlayerProxy.create_item(new_player, enable_automatic_id_generation=True)
    return HttpResponse(body=json.dumps({"result": True, "msg" : "OK"}), mimetype="application/json")