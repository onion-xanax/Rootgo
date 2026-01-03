from flask import Flask, send_file, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_file('web.html')

@app.route('/web.css')
def css():
    return send_file('web.css')

@app.route('/web.js')
def js():
    return send_file('web.js')

@app.route('/icon/<path:filename>')
def icon(filename):
    icons_dir = os.path.join(os.path.dirname(__file__), 'icon')
    return send_from_directory(icons_dir, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
