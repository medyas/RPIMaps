import subprocess
from shutil import copyfile
import os, requests, json
from flask import Flask
from flask import request, session, redirect, render_template, url_for, send_from_directory

counter = 0
data = json.load(open('/var/www/flask/rpiMaps/data/data.json', encoding='utf-8'))

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ads/<path:path>')
def send_video(path):
    return send_from_directory('ads', path)

@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)

@app.route('/media/<path:path>')
def send_audio(path):
    return send_from_directory('media', path)

@app.route('/static/<path:path>')
def send_music(path):
    return send_from_directory('static', path)

@app.route('/getmusic')
def getmusic():
    arr = [x for x in os.listdir('/var/www/flask/rpiMaps/static/music') if x.endswith(".mp3")]
    if(arr != []):
        audio = [{'title':a[:-4], 'link':'/static/music/'+a.replace(' ', '%20')} for a in arr]
        sortedAudio = sorted(audio, key=lambda k: k['title'])
        return json.dumps(sortedAudio)
    return ""

@app.route('/getaudio')
def getaudio():
    script = '/var/www/flask/rpiMaps/scripts/./audio.sh'
    audio = []
    sortedAudio = []
    process  = subprocess.Popen([script], stdout=subprocess.PIPE)
    output, error = process.communicate()
    if(output!=b''):
        output = [a for a in output.decode("utf-8").split('\n') if a != ""]
        audio = [{'title':(a[a.rfind('/')+1:])[:-4], 'link':a[a.find('media'):].replace(' ', '%20')} for a in output]
        sortedAudio = sorted(audio, key=lambda k: k['title'])
        return json.dumps(sortedAudio)
    return ""

@app.route('/getads')
def getads():
    script = '/var/www/flask/rpiMaps/scripts/./video.sh'
    audio = []
    sortedVideo = []
    process  = subprocess.Popen([script], stdout=subprocess.PIPE)
    output, error = process.communicate()
    if(output!=b''):
        output = [a for a in output.decode("utf-8").split('\n') if a != ""]
        video = [{'title':a[a.rfind('/')+1:], 'link':a[a.find('ads'):].replace(' ', '%20')} for a in output]
        sortedVideo = sorted(video, key=lambda k: k['title'])
        return json.dumps(sortedVideo)
    return ""

@app.route('/favmusic', methods=['GET', 'POST'])
def favmusic():
    link = ''
    title = ''
    duration = ''
    if request.method == 'GET':
        link = request.args.get('link')
        title = request.args.get('title')
        duration = request.args.get('duration')
    else:
        return redirect(url_for('index'))

    d = os.path.dirname(os.path.abspath(__file__))
    copyfile('/var/www/flask/rpiMaps/'+link.replace('%20', ' '), '/var/www/flask/rpiMaps/static/music/'+title+".mp3")

    return 'success'

@app.route('/gpsdata')
def gpsData():
    global data, counter
    temp = []
    if(counter+1 > len(data)):
        counter = 0
        temp = data[counter]
    else:
        temp = data[counter]
        counter+=1
    return json.dumps(temp)


@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('index'))


app.secret_key = os.urandom(512)

if __name__ == '__main__':
    app.run(threaded=True)

