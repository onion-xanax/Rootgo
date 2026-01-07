from flask import Flask, send_file, send_from_directory, request, jsonify
import os
import json
import time

app = Flask(__name__)

if not os.path.exists('saves'):
    os.makedirs('saves')

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

@app.route('/dosier')
def dosier():
    return send_file('dosier/web.html')

@app.route('/dosier/web.css')
def dosier_css():
    return send_file('dosier/web.css')

@app.route('/dosier/web.js')
def dosier_js():
    return send_file('dosier/web.js')

@app.route('/dosier/logo/<path:filename>')
def dosier_logo(filename):
    logo_dir = os.path.join(os.path.dirname(__file__), 'dosier', 'logo')
    return send_from_directory(logo_dir, filename)

@app.route('/logo/<path:filename>')
def logo(filename):
    logo_dir = os.path.join(os.path.dirname(__file__), 'logo')
    return send_from_directory(logo_dir, filename)

@app.route('/osint')
def osint():
    return "OSINT tools page (в разработке)"

@app.route('/pentest')
def pentest():
    return "Pentest tools page (в разработке)"

@app.route('/serenity')
def serenity():
    return "Serenity AI page (в разработке)"

@app.route('/api/save-dossier', methods=['POST'])
def save_dossier():
    try:
        data = request.json
        filename = f"dossier_{data.get('type', 'main')}_{int(time.time())}.json"
        
        with open(f"saves/{filename}", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Досье сохранено',
            'filename': filename
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/load-dossiers')
def load_dossiers():
    try:
        if not os.path.exists('saves'):
            return jsonify([])
        
        files = []
        for f in os.listdir('saves'):
            if f.endswith('.json'):
                files.append({
                    'name': f,
                    'created': os.path.getctime(f"saves/{f}")
                })
        
        return jsonify(sorted(files, key=lambda x: x['created'], reverse=True))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
