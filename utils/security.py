"""
SystemHacks - Module de sécurité
Fonctions de validation et protection
"""
import bleach
import re
import hashlib
import secrets
from flask import request, abort, current_app
from datetime import datetime
import logging

# Configuration du logging sécurisé
security_logger = logging.getLogger('security')
handler = logging.FileHandler('logs/security.log')
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
security_logger.addHandler(handler)
security_logger.setLevel(logging.WARNING)

class SecurityValidator:
    """Classe pour toutes les validations de sécurité"""
    
    @staticmethod
    def sanitize_html(content):
        """Nettoie le contenu HTML pour éviter XSS"""
        if not content:
            return ""
        
        allowed_tags = [
            'p', 'br', 'strong', 'em', 'code', 'pre', 
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'
        ]
        allowed_attributes = {
            'code': ['class'],
            'pre': ['class']
        }
        
        cleaned = bleach.clean(
            content, 
            tags=allowed_tags, 
            attributes=allowed_attributes,
            strip=True
        )
        
        return cleaned
    
    @staticmethod
    def validate_slug(slug):
        """Valide les slugs pour éviter les injections de chemin"""
        if not slug:
            abort(400, "Slug manquant")
        
        # Seuls les caractères alphanumériques, tirets et underscores
        if not re.match(r'^[a-zA-Z0-9-_]{1,50}$', slug):
            security_logger.warning(f"Slug invalide tenté: {slug}")
            abort(400, "Slug invalide")
        
        # Éviter les chemins relatifs
        if '..' in slug or '/' in slug or '\\' in slug:
            security_logger.warning(f"Tentative de traversée de répertoire: {slug}")
            abort(403, "Accès interdit")
        
        return slug
    
    @staticmethod
    def validate_search_query(query):
        """Valide les requêtes de recherche"""
        if not query:
            return ""
        
        # Limite de longueur
        if len(query) > 100:
            abort(400, "Recherche trop longue")
        
        # Nettoyer les caractères dangereux
        dangerous_chars = ['<', '>', '"', "'", '&', ';', '|', '`']
        for char in dangerous_chars:
            if char in query:
                security_logger.warning(f"Caractère dangereux dans recherche: {query}")
                query = query.replace(char, '')
        
        return query.strip()
    
    @staticmethod
    def check_file_upload(file):
        """Valide les fichiers uploadés"""
        if not file or not file.filename:
            return False
        
        filename = file.filename.lower()
        
        # Extensions autorisées
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
        if not ('.' in filename and filename.rsplit('.', 1)[1] in allowed_extensions):
            return False
        
        # Taille maximale (5MB)
        file.seek(0, 2)  # Aller à la fin
        file_size = file.tell()
        file.seek(0)  # Revenir au début
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return False
        
        return True

class SecurityMonitor:
    """Surveillance et détection des menaces"""
    
    @staticmethod
    def log_suspicious_activity(activity_type, details):
        """Log les activités suspectes"""
        client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
        security_logger.warning(
            f"ACTIVITÉ SUSPECTE - Type: {activity_type} - "
            f"IP: {client_ip} - UA: {user_agent} - "
            f"Détails: {details}"
        )
    
    @staticmethod
    def check_malicious_patterns():
        """Détecte les patterns malveillants dans les requêtes"""
        user_agent = request.headers.get('User-Agent', '').lower()
        request_path = request.path.lower()
        
        # Patterns de bots malveillants
        malicious_ua_patterns = [
            'sqlmap', 'nikto', 'nmap', 'masscan', 'dirb', 'gobuster',
            'burpsuite', 'owasp', 'w3af', 'acunetix'
        ]
        
        for pattern in malicious_ua_patterns:
            if pattern in user_agent:
                SecurityMonitor.log_suspicious_activity(
                    "MALICIOUS_USER_AGENT", 
                    f"Pattern: {pattern}"
                )
                abort(403)
        
        # Patterns d'injection dans l'URL
        injection_patterns = [
            'union', 'select', 'insert', 'delete', 'drop', 'exec',
            '../', '..\\', '/etc/passwd', '/proc/', 'cmd.exe'
        ]
        
        for pattern in injection_patterns:
            if pattern in request_path:
                SecurityMonitor.log_suspicious_activity(
                    "INJECTION_ATTEMPT", 
                    f"Pattern: {pattern} in path: {request_path}"
                )
                abort(403)
    
    @staticmethod
    def rate_limit_check(identifier, max_requests=60, window=3600):
        """Vérification simple du rate limiting"""
        # Ici vous pourriez implémenter Redis ou une base de données
        # Pour l'instant, on fait un contrôle basique
        pass

def generate_csrf_token():
    """Génère un token CSRF sécurisé"""
    return secrets.token_urlsafe(32)

def hash_password(password):
    """Hash sécurisé des mots de passe"""
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(password, hashed_password):
    """Vérifie un mot de passe hashé"""
    try:
        salt, hash_hex = hashed_password.split(':')
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return hashed.hex() == hash_hex
    except:
        return False
