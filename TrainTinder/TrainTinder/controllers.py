from flask import Flask, json,Response
from TrainTinder import app
import pyreadr


@app.route('/request', methods=['GET'])
def get_hetpoints():
    #result = pyreadr.read_r('TrainTinder/data/ut_2018-05-07.RData') # also works for Rds
    #response = result["data_vloerveld"]
    #return Response( json.dumps(response),mimetype = "application/json")
    return Response(json.dumps("'{'subject':'test'}"))