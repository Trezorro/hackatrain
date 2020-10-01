"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import Flask, render_template, Response, json
from TrainTinder import app
import pyreadr
import datetime as dt
import pandas as pd
api = Flask(__name__)

DEFAULT_TIME = dt.datetime(2018,5,13,9,6,40)
DEFAULT_PERRON = 'quth1a'

@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )


@api.route('/request', methods=['GET'])
def get_teams():
    df = pd.read_csv("TrainTinder/data/ut_2018-05-07.csv", index_col=1).rename(columns={"Unnamed: 0": 'row'})
    df.index = pd.to_datetime(df.index, infer_datetime_format=True)
    response = [dict(perron1=df.loc[DEFAULT_TIME, DEFAULT_PERRON])]

    return Response( json.dumps(response),mimetype = "application/json")

if __name__ == '__main__':
    api.run()
