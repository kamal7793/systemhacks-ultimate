from flask import Flask, render_template, request, jsonify, redirect, url_for
from functools import wraps
from flask import session, redirect, url_for, flash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre-cle-secrete-ici'

# Décorateur pour protéger les pages
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Vous devez vous connecter pour accéder au forum.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Protéger la route forum
@app.route('/forum')
@login_required
def forum():
    return render_template('forum.html')

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
    

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Ici tu peux ajouter la vérification en base de données
        # Pour l'instant, connexion simple
        if username and password:
            session['user_id'] = username
            session['username'] = username
            flash('Connexion réussie !', 'success')
            return redirect(url_for('forum'))
        else:
            flash('Nom d\'utilisateur et mot de passe requis.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Ici tu peux ajouter l'enregistrement en base
        if username and email and password:
            flash('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Tous les champs sont requis.', 'error')
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Vous avez été déconnecté.', 'info')
    return redirect(url_for('index'))
