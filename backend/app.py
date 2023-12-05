import time

from flask import Flask, request, Response, jsonify
from pymongo import MongoClient

from datetime import datetime

x = datetime.now()
# Initializing flask app
app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.analytic_db
request_log = db.request_log


@app.route('/hello-world/')
def hello_world():
    user_id = request.args.get("user_id")
    if not user_id.isdigit():
        response_body = {"message": "Not a valid user id"}
        status = 403
        response = Response(response_body, status=status)
    else:
        response_body = {"message": "hello World"}
        status = 200
        response = jsonify(response_body)
    timestamp = int(time.time())
    request_log.insert_one({"user_id": user_id,
                            "timestamp": timestamp,
                            "request": {
                                "host": request.host,
                                "host_url": request.host_url,
                                "params": request.args,
                                "headers": dict(request.headers),
                                "content_type": request.content_type
                            },
                            "response": {
                                "body": response_body,
                                "status": response.status_code,
                                "headers": dict(response.headers),
                                "mimetype": response.mimetype,
                                "content_type": response.content_type
                            }})
    return response


@app.route("/filter/")
def filter_data():
    start_date = request.args.get("start_time", datetime.now().strftime("%d/%m/%YT%H:%M:%S"))
    end_date = request.args.get("end_time", datetime.now().strftime("%d/%m/%YT%H:%M:%S"))
    start_date = datetime.strptime(start_date, "%d/%m/%YT%H:%M:%S").strftime('%s')
    end_date = datetime.strptime(end_date, "%d/%m/%YT%H:%M:%S").strftime('%s')
    query = {
        "timestamp": {
            "$gte": int(start_date),
            "$lte": int(end_date)
        }
    }
    user_response = list(request_log.find(query).sort({"timestamp": -1}))
    unique_user_query = [{
        "$match": {
            "timestamp": {
                "$gte": int(start_date),
                "$lte": int(end_date)
            },
        }
    },
        {
            "$group": {
                "_id": {"user_id": "$user_id", "status": "$response.status"},
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "count": -1
            },
        }
    ]

    unique_user_response = list(request_log.aggregate(unique_user_query))
    total_count = 0
    unique_user_set = set()
    for e in unique_user_response:
        total_count += e["count"]
        unique_user_set.add(e["_id"]["user_id"])
    for e in user_response:
        e["_id"] = str(e["_id"])
    final_response = {
        "user_data": user_response,
        "unique_user_response": unique_user_response,
        "unique_user": len(unique_user_set),
        "total_call": total_count
    }
    return final_response


# Running app
if __name__ == '__main__':
    app.run(debug=True)
