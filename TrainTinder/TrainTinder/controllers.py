from flask import Flask, json,Response
from TrainTinder import app
import datetime as dt
import pandas as pd


DEFAULT_TIME = dt.datetime(2018,5,7,9,6,40)
DEFAULT_PERRON = 'quth1a'


@app.route('/request', methods=['GET'])
def get_hetpoints():
    df = pd.read_csv("TrainTinder/data/ut_2018-05-07.csv", index_col=1).rename(columns={"Unnamed: 0": 'row'})
    df.index = pd.to_datetime(df.index, infer_datetime_format=True)
    response = [dict(perron1=df.loc[DEFAULT_TIME, DEFAULT_PERRON])]
    return Response( json.dumps(response),mimetype = "application/json")