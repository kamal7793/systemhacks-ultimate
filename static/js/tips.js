// SystemHacks - JavaScript pour les pages d'astuces

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeCopyButtons();
    initializeSearch();
    initializeAnimations();
});

// Système de filtres
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tipCards = document.querySelectorAll('.tip-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Mettre à jour les boutons actifs
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrer les cartes avec animation
            filterTips(filter, tipCards);
            
            // Animation de comptage
            updateTipCount(filter);
        });
    });
}

// Filtrage des astuces avec animation
function filterTips(filter, tipCards) {
    tipCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        
        setTimeout(() => {
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.classList.add('show');
                card.classList.remove('hidden');
                
                // Animation d'apparition
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    card.style.display = 'none';
                    card.classList.add('hidden');
                    card.classList.remove('show');
                }, 300);
            }
        }, index * 50); // Animation échelonnée
    });
}

// Mise à jour du compteur d'astuces
function updateTipCount(filter) {
    setTimeout(() => {
        const visibleTips = document.querySelectorAll('.tip-card:not(.hidden)').length;
        const filterText = filter === 'all' ? 'toutes les astuces' : `astuces ${filter}`;
        
        // Créer ou mettre à jour le compteur
        let counter = document.querySelector('.tips-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'tips-counter';
            document.querySelector('.filters').appendChild(counter);
        }
        
        counter.textContent = `${visibleTips} ${filterText} trouvées`;
        counter.style.cssText = `
            text-align: center;
            margin-top: 1rem;
            color: #6b7280;
            font-weight: 500;
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 20px;
            display: inline-block;
            animation: fadeIn 0.5s ease;
        `;
    }, 500);
}

// Fonction de copie des astuces
function initializeCopyButtons() {
    // Boutons de copie des cartes d'astuces
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-icon') && e.target.getAttribute('onclick')) {
            e.preventDefault();
            const tipCard = e.target.closest('.tip-card');
            
            if (tipCard) {
                const title = tipCard.querySelector('h3').textContent;
                const description = tipCard.querySelector('p').textContent;
                const codeElement = tipCard.querySelector('.tip-preview code');
                const code = codeElement ? codeElement.textContent : '';
                
                const textToCopy = `🔧 ${title}\n\n${description}\n\n💻 Commande:\n${code}\n\n📱 SystemHacks - Vos astuces système`;
                
                copyToClipboard(textToCopy, e.target);
            }
        }
    });
}

// Copier les commandes rapides
function copyCommand(command) {
    const button = event.target;
    copyToClipboard(command, button);
    
    // Animation visuelle
    const originalBg = button.style.background;
    const originalText = button.textContent;
    
    button.style.background = '#059669';
    button.textContent = '✓';
    button.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        button.style.background = originalBg || '#10b981';
        button.textContent = originalText || '📋';
        button.style.transform = 'scale(1)';
    }, 1200);
}

// Fonction générique de copie
function copyToClipboard(text, button = null) {
    if (navigator.clipboard && window.isSecureContext) {
        // API moderne
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.error('Erreur de copie:', err);
            fallbackCopy(text, button);
        });
    } else {
        // Fallback pour les navigateurs plus anciens
        fallbackCopy(text, button);
    }
}

// Méthode de copie alternative
function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Erreur de copie:', err);
        showCopyError(button);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Affichage du succès de copie
function showCopySuccess(button) {
    if (button) {
        const originalText = button.textContent;
        button.textContent = '✅';
        button.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.transform = 'scale(1)';
        }, 1500);
    }
    
    // Notification toast
    showToast('✅ Copié dans le presse-papiers !', 'success');
}

// Affichage d'erreur de copie
function showCopyError(button) {
    if (button) {
        const originalText = button.textContent;
        button.textContent = '❌';
        button.style.color = '#ef4444';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.color = '';
        }, 1500);
    }
    
    showToast('❌ Erreur lors de la copie', 'error');
}

// Système de notifications toast
function showToast(message, type = 'info') {
    // Supprimer les anciens toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Styles du toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Supprimer automatiquement
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Recherche dans les astuces
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();
            searchTips(query);
        }, 300);
    });
}

// Fonction de recherche
function searchTips(query) {
    const tipCards = document.querySelectorAll('.tip-card');
    let visibleCount = 0;
    
    tipCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const category = card.getAttribute('data-category').toLowerCase();
        
        const matches = !query || 
            title.includes(query) || 
            description.includes(query) || 
            category.includes(query);
        
        if (matches) {
            card.style.display = 'block';
            card.classList.remove('hidden');
            visibleCount++;
            
            // Surligner les termes trouvés
            highlightSearchTerms(card, query);
        } else {
            card.style.display = 'none';
            card.classList.add('hidden');
        }
    });
    
    // Mettre à jour le compteur
    updateSearchCount(visibleCount, query);
}

// Surlignage des termes de recherche
function highlightSearchTerms(card, query) {
    if (!query) return;
    
    const title = card.querySelector('h3');
    const description = card.querySelector('p');
    
    [title, description].forEach(element => {
        const originalText = element.textContent;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark style="background: #fef08a; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>');
        
        if (highlightedText !== originalText) {
            element.innerHTML = highlightedText;
        }
    });
}

// Mise à jour du compteur de recherche
function updateSearchCount(count, query) {
    let counter = document.querySelector('.search-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'search-counter';
        const container = document.querySelector('.tips-section .container');
        if (container) {
            container.insertBefore(counter, container.querySelector('.tips-grid'));
        }
    }
    
    if (query) {
        counter.textContent = `${count} résultat${count !== 1 ? 's' : ''} pour "${query}"`;
        counter.style.cssText = `
            text-align: center;
            margin: 1rem 0;
            padding: 0.75rem;
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            color: #1e40af;
            font-weight: 500;
        `;
    } else {
        counter.style.display = 'none';
    }
}

// Animations au scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observer toutes les cartes d'astuces
    document.querySelectorAll('.tip-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        observer.observe(card);
    });
}

// Animations CSS dynamiques
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .tip-card {
        transition: all 0.3s ease;
    }
    
    .tip-card:hover {
        transform: translateY(-5px) scale(1.02);
    }
`;
document.head.appendChild(style);

// Fonction globale pour les onclick dans le HTML
window.copyTip = function(button) {
    const tipCard = button.closest('.tip-card');
    if (tipCard) {
        const title = tipCard.querySelector('h3').textContent;
        const description = tipCard.querySelector('p').textContent;
        const codeElement = tipCard.querySelector('.tip-preview code');
        const code = codeElement ? codeElement.textContent : '';
        
        const textToCopy = `🔧 ${title}\n\n${description}\n\n💻 Commande:\n${code}\n\n📱 SystemHacks`;
        
        copyToClipboard(textToCopy, button);
    }
};

// Fonction globale pour copier les commandes
window.copyCommand = copyCommand;

console.log('🔧 SystemHacks Tips JavaScript chargé avec succès !');