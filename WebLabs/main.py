import http
import json
import pymysql
import os

from flask import Flask, render_template, request

app = Flask(__name__)


class myDbConnection:
    def __init__(self):
        self.connection = None

    def connect(self):
        self.connection = pymysql.connect(
                            host=os.getenv('DB_HOST', 'localhost'),
                            user=os.getenv('DB_USER', 'root'),
                            password=os.getenv('DB_PASSWORD', 'root'),
                            db=os.getenv('DB_NAME', 'todolist'),
                            cursorclass=pymysql.cursors.DictCursor
                            )
        return self.connection




@app.route('/notes')
def notesPage():
    return render_template('index.html')

@app.route('/getNotes', methods=['GET'])
def getNotes():
    with myDbConnection().connect() as db:
        cur = db.cursor()
        cur.execute(f"SELECT * FROM notes")
        notes = cur.fetchall()
    return notes

@app.route('/addNote', methods=['POST'])
def addNote():
    myList = request.get_data()
    myList = myList.decode("utf-8").replace("'", '"')
    myList = json.loads(myList)

    with myDbConnection().connect() as db:
        cur = db.cursor()
        name = myList[0]
        date = myList[2]
        priority = myList[3]
        cur.execute(f"INSERT INTO `notes` (`Note_ID`, `Name`, `Date`, `Priority`) VALUES (NULL, '{name}', '{date}', '{priority}');")
        db.commit()

        cur.execute(f"SELECT Note_ID FROM notes ORDER by Note_ID DESC LIMIT 1")
        idNote = cur.fetchone()['Note_ID']

        for sub in myList[1]:
            cur.execute(f"INSERT INTO `tasks` (`Task_ID`, `Content`, `Done`, `ID_Note`) VALUES (NULL, '{sub}', '0', {idNote});")
        db.commit()

    return str(idNote), http.HTTPStatus(200)

@app.route('/getSubtasks/<int:id>', methods=['GET'])
def getSubtasks(id):
    with myDbConnection().connect() as db:
        cur = db.cursor()
        cur.execute(f"SELECT * FROM tasks where ID_Note = {id}")
        tasks = cur.fetchall()
        if tasks:
            return tasks, http.HTTPStatus(200)
        else:
            return "empty", http.HTTPStatus(200)

@app.route('/editNote/<int:id>', methods=['POST'])
def editNote(id):
    data = request.get_data()
    data = data.decode("utf-8").replace("'", '"')
    data = json.loads(data)
    with myDbConnection().connect() as db:
        cur = db.cursor()
        cur.execute(f"update `notes` "
                    f"set `Name` = '{data[0]}', `Priority` = '{data[1]}'"
                    f"where `Note_ID` = {id}")
        db.commit()
        cur.execute(f"delete from `tasks` where `ID_Note` = {id}")
        db.commit()
        for subtask in data[2]:
            cur.execute(f"INSERT INTO `tasks` (`Content`, `Done`, `ID_Note`) "
                        f"VALUES ('{subtask[0]}', '{subtask[1]}', {id})")
        db.commit()
    return "success", http.HTTPStatus(200)


# ту ду:
# - добавить комментарии (возможно)
# - добавить удаление блокнота


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8081)




