from flask import Flask, render_template, request, jsonify, redirect, url_for
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre-cle-secrete-ici'

# Route principale
@app.route('/')
def index():
    return render_template('index.html')

# Route astuces
@app.route('/astuces')
def astuces():
    category = request.args.get('category', 'all')
    return render_template('astuces.html', category=category)

# 🆕 ROUTE FORUM MANQUANTE - AJOUTÉE !
@app.route('/forum')
def forum():
    return render_template('forum.html')

# Routes spécifiques (si vous les utilisez)
@app.route('/windows')
def windows():
    return render_template('astuces.html', category='windows')

@app.route('/linux')
def linux():
    return render_template('astuces.html', category='linux')

@app.route('/security')
def security():
    return render_template('astuces.html', category='security')

# Gestion d'erreurs
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
