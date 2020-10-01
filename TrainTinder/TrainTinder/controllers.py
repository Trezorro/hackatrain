from flask import Flask, json, Response, request
from TrainTinder import app
import datetime as dt
import pandas as pd
from geopy import distance

DEFAULT_TIME = dt.datetime(2018,5,7,9,6,40)
DEFAULT_PERRON = 'quth1a'

NORTH_END = (52.090124, 5.110178)
SOUTH_END = (52.089141, 5.111005)
PERRON_BEARING = 152.6643466

def list_block_names():
    result = []
    for i in range(28,0,-1):
        result.append(f'qut{i}Ad')

    for i in range(28,0,-1):
        result.append(f'qut{i}As')
    
    result += ['qut27B', 'qut26B', 'qut24B', 'qut23B', 'qut11B', 'qut10B']
    result += ['qut27C',           'qut24C', 'qut23C', 'qut11C', 'qut10C']
    return result


def coordinate_tuples():
    """Return the start and end point of block number x from NO to SO.
    
    TODO:
     - kleine blokjes meenemen
     - A-D blokken meenemen
    """
    X_DISTANCES = [5]*20 + [2.5]*8 # from north to south
    Y_DISTANCES = [.8, 2.2] # from NE to SW
    X_ALTER1 = [7, 12, 22, 24, 17*5, 18 *5]
    X_ALTER2 = [7, 22, 24, 17*5, 18 *5]

    y = 0
    x = 0
    start = NORTH_END # distance.distance(meters=x).destination(NORTH_END,PERRON_BEARING) 
    for dy in Y_DISTANCES:
        row_start = distance.distance(meters=y).destination(NORTH_END,PERRON_BEARING+90) 
        for dx in X_DISTANCES:
            start = distance.distance(meters=x).destination(row_start,PERRON_BEARING)[0:2] 
            end = distance.distance(meters=x+dx).destination(row_start,PERRON_BEARING)[0:2] 
            yield (start,end)
            x += dx
        x = 0
        y += dy
    ## hacked the following for the alternative blocks:
    row_start = distance.distance(meters=y).destination(NORTH_END,PERRON_BEARING+90) 
    for x in X_ALTER1:
        start = distance.distance(meters=x).destination(row_start,PERRON_BEARING)[0:2] 
        end = distance.distance(meters=x+5).destination(row_start,PERRON_BEARING)[0:2]  
        yield (start,end)
    y += 2.2
    row_start = distance.distance(meters=y).destination(NORTH_END,PERRON_BEARING+90) 
    for x in X_ALTER2:
        start = distance.distance(meters=x).destination(row_start,PERRON_BEARING)[0:2]  
        end = distance.distance(meters=x+5).destination(row_start,PERRON_BEARING)[0:2]  
        yield (start,end)
    


@app.route('/map', methods=['GET'])
def get_map_blocks():
    """TODO: selection of correct file
    - what if index doesnt exist."""
    timestamp = request.args.get('timestamp')
    print(timestamp)
    blocks = list_block_names()
    df = pd.read_csv("TrainTinder/data/ut_2018-05-07.csv", index_col=1).rename(columns={"Unnamed: 0": 'row'})
    df.index = pd.to_datetime(df.index, infer_datetime_format=True)
    weights = df.loc[timestamp, blocks]
    result = []
    for w, coords in zip(weights,coordinate_tuples()):
        result.append({
            'weight': w,
            'start': coords[0],
            'end': coords[1]
        })

    return Response( json.dumps(result),mimetype = "application/json")

@app.route('/meet', methods=['GET'])
def meet():
    timestamp = request.args.get('timestamp')
    print("meet at:", timestamp)

    blocks = list_block_names()
    df = pd.read_csv("TrainTinder/data/ut_2018-05-07.csv", index_col=1).rename(columns={"Unnamed: 0": 'row'})
    df.index = pd.to_datetime(df.index, infer_datetime_format=True)
    min_weight_block = df.loc[timestamp, blocks].idxmin()
    coords = list(coordinate_tuples())
    min_coord = coords[blocks.index(min_weight_block)]
    lat = (min_coord[1][0] + min_coord[0][0]) / 2
    lon = (min_coord[1][1] + min_coord[0][1]) / 2
    return Response( json.dumps({'lat': lat, 'lon': lon}),mimetype = "application/json")

