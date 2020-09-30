"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import Flask, render_template
from TrainTinder import app
import pyreadr
api = Flask(__name__)



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
    result = pyreadr.read_r('TrainTinder/data/ut_2018-05-07.RData') # also works for Rds
    response = result["data_vloerveld"]
    return Response( json.dumps(response),mimetype = "application/json")

