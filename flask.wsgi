import sys


dir = "/var/www/flask/rpiMaps"
sys.path.insert(0, dir)

from rpiMaps import app as application

