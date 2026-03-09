// ============================================================================
// PROJETO VOZES DA PERIFERIA - SCRIPT PRINCIPAL
// ============================================================================

// ============================================================================
// 1. MENU HAMBÚRGUER (MOBILE)
// ============================================================================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function toggleMenu(forceClose = false) {
    if (!navMenu || !navToggle) return;

    const isActive = forceClose ? false : !navMenu.classList.contains('active');

    navToggle.classList.toggle('active', isActive);
    navMenu.classList.toggle('active', isActive);
    if (navOverlay) navOverlay.classList.toggle('active', isActive);

    if (isActive) {
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    } else {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

// Eventos do botão hambúrguer
if (navToggle) {
    // Click
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Touch (mobile)
    navToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    }, { passive: false });
}

// Fechar ao clicar no overlay
if (navOverlay) {
    navOverlay.addEventListener('click', () => toggleMenu(true));
}

// Fechar ao clicar nos links de navegação
if (navMenu) {
    const menuLinks = navMenu.querySelectorAll('li > a:not(.language-btn-mobile):not(.dropdown-toggle)');

    menuLinks.forEach(link => {
        // ✅ IGNORA: seletor de idiomas, dropdown "Minha Conta"
        if (link.closest('.nav-language-mobile')) return;
        if (link.closest('.dropdown')) return;
        if (link.classList.contains('dropdown-toggle')) return;

        function navigateToSection(e) {
            const href = link.getAttribute('href');

            if (href && href.startsWith('#')) {
                e.preventDefault();
                e.stopPropagation();

                // Fecha o menu primeiro
                toggleMenu(true);

                // Aguarda menu fechar antes de scrollar
                setTimeout(() => {
                    const target = document.querySelector(href);

                    if (target) {
                        // Libera o body para poder scrollar
                        document.body.style.overflow = '';
                        document.body.style.position = '';

                        // Scroll para a seção (80px = altura da navbar)
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }, 400);
            }
        }

        link.addEventListener('click', navigateToSection);
        link.addEventListener('touchend', (e) => {
            e.preventDefault();
            navigateToSection(e);
        }, { passive: false });
    });
}

// Fechar menu ao pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        toggleMenu(true);
    }
});

// Prevenir scroll do fundo quando menu está aberto
if (navMenu) {
    navMenu.addEventListener('touchmove', (e) => {
        if (navMenu.classList.contains('active')) {
            e.stopPropagation();
        }
    }, { passive: true });
}
// ============================================================================
// 2. DROPDOWN "MINHA CONTA" - MELHORADO
// ============================================================================

class AccountDropdown {
    constructor() {
        this.dropdown = null;
        this.toggle = null;
        this.menu = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.toggle = document.querySelector('.dropdown-toggle');
        if (!this.toggle) return;

        this.dropdown = this.toggle.closest('.dropdown');
        this.menu = this.dropdown?.querySelector('.dropdown-menu');

        if (!this.menu) return;

        this.styleElements();
        this.attachEvents();

        console.log('✅ Dropdown Minha Conta inicializado');
    }

    styleElements() {
        // Estiliza o botão toggle
        this.toggle.style.cssText = `
            position: relative;
            padding: 10px 20px;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            overflow: hidden;
        `;

        // Adiciona efeito de brilho no hover
        this.toggle.addEventListener('mouseenter', () => {
            if (!this.isOpen) {
                this.toggle.style.background = 'rgba(255, 255, 255, 0.08)';
                this.toggle.style.transform = 'translateY(-2px)';
                this.toggle.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }
        });

        this.toggle.addEventListener('mouseleave', () => {
            if (!this.isOpen) {
                this.toggle.style.background = 'transparent';
                this.toggle.style.transform = 'translateY(0)';
                this.toggle.style.boxShadow = 'none';
            }
        });

        // Estiliza o menu dropdown
        this.menu.style.cssText = `
            position: absolute;
            top: calc(100% + 12px);
            right: 0;
            background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(0, 0, 0, 0.95) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 8px;
            min-width: 200px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px) scale(0.95);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
            z-index: 1000;
        `;

        // Estiliza os itens do menu
        const menuItems = this.menu.querySelectorAll('a');
        menuItems.forEach((item, index) => {
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 15px;
                font-weight: 500;
                position: relative;
                overflow: hidden;
            `;

            // Adiciona ícone animado
            const icon = item.querySelector('i') || this.createIcon(item, index);
            icon.style.transition = 'transform 0.3s ease';

            // Efeitos hover avançados
            item.addEventListener('mouseenter', () => {
                item.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)';
                item.style.transform = 'translateX(6px)';
                item.style.color = '#ffffff';
                icon.style.transform = 'scale(1.1) rotate(5deg)';

                // Efeito shimmer
                this.createShimmer(item);
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.style.transform = 'translateX(0)';
                item.style.color = 'rgba(255, 255, 255, 0.9)';
                icon.style.transform = 'scale(1) rotate(0deg)';
            });

            // Feedback de clique
            item.addEventListener('mousedown', () => {
                item.style.transform = 'translateX(6px) scale(0.98)';
            });

            item.addEventListener('mouseup', () => {
                item.style.transform = 'translateX(6px) scale(1)';
            });
        });

        // Adiciona seta animada
        this.createArrow();
    }

    createIcon(item, index) {
        const icons = ['', '', ''];
        const icon = document.createElement('span');
        icon.textContent = icons[index] || '•';
        icon.style.fontSize = '18px';
        item.insertBefore(icon, item.firstChild);
        return icon;
    }

    createArrow() {
        let arrow = this.toggle.querySelector('.arrow-account');
        if (!arrow) {
            arrow = document.createElement('span');
            arrow.className = 'arrow-account';
            arrow.innerHTML = '▼';
            arrow.style.cssText = `
                font-size: 10px;
                margin-left: 4px;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                display: inline-block;
                opacity: 0.7;
            `;
            this.toggle.appendChild(arrow);
        }
        return arrow;
    }

    createShimmer(element) {
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            pointer-events: none;
        `;
        element.appendChild(shimmer);

        shimmer.style.animation = 'shimmer 0.6s ease';
        setTimeout(() => shimmer.remove(), 600);
    }

    attachEvents() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && this.isOpen) {
                this.close();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.dropdown.classList.add('active');

        // Anima o menu
        this.menu.style.opacity = '1';
        this.menu.style.visibility = 'visible';
        this.menu.style.transform = 'translateY(0) scale(1)';

        // Anima a seta
        const arrow = this.toggle.querySelector('.arrow-account');
        if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
            arrow.style.opacity = '1';
        }

        // Estilo do botão quando aberto
        this.toggle.style.background = 'rgba(255, 255, 255, 0.12)';
        this.toggle.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

        // Anima os itens com stagger
        const items = this.menu.querySelectorAll('a');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50 * (index + 1));
        });

        // Efeito de pulso na borda
        this.pulseBorder();

        console.log('🔓 Dropdown Minha Conta ABERTO');
    }

    close() {
        this.isOpen = false;
        this.dropdown.classList.remove('active');

        // Anima o menu
        this.menu.style.opacity = '0';
        this.menu.style.visibility = 'hidden';
        this.menu.style.transform = 'translateY(-10px) scale(0.95)';

        // Anima a seta
        const arrow = this.toggle.querySelector('.arrow-account');
        if (arrow) {
            arrow.style.transform = 'rotate(0deg)';
            arrow.style.opacity = '0.7';
        }

        // Volta o estilo do botão
        this.toggle.style.background = 'transparent';
        this.toggle.style.boxShadow = 'none';

        console.log('🔒 Dropdown Minha Conta FECHADO');
    }

    pulseBorder() {
        if (!this.isOpen) return;

        this.menu.style.borderColor = 'rgba(255, 255, 255, 0.3)';

        setTimeout(() => {
            if (!this.isOpen) return;
            this.menu.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            setTimeout(() => this.pulseBorder(), 2000);
        }, 1000);
    }
}

// ============================================================================
// 3. SELETOR DE IDIOMAS - MELHORADO
// ============================================================================

class LanguageSelector {
    constructor(isDesktop = true) {
        this.isDesktop = isDesktop;
        this.button = null;
        this.dropdown = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        const buttonId = this.isDesktop ? 'languageBtn' : 'languageBtnMobile';
        const dropdownId = this.isDesktop ? 'languageDropdown' : 'languageDropdownMobile';

        this.button = document.getElementById(buttonId);
        this.dropdown = document.getElementById(dropdownId);

        if (!this.button || !this.dropdown) return;

        this.styleElements();
        this.attachEvents();

        console.log(`✅ Seletor de Idiomas ${this.isDesktop ? 'Desktop' : 'Mobile'} inicializado`);
    }

    styleElements() {
        // Estiliza o botão
        this.button.style.cssText = `
            position: relative;
            padding: 10px 20px;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            overflow: hidden;
        `;

        // Hover effects
        this.button.addEventListener('mouseenter', () => {
            if (!this.isOpen) {
                this.button.style.background = 'rgba(255, 255, 255, 0.08)';
                this.button.style.transform = 'translateY(-2px)';
                this.button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }
        });

        this.button.addEventListener('mouseleave', () => {
            if (!this.isOpen) {
                this.button.style.background = 'transparent';
                this.button.style.transform = 'translateY(0)';
                this.button.style.boxShadow = 'none';
            }
        });

        // Estiliza o dropdown
        if (this.isDesktop) {
            this.dropdown.style.cssText = `
                position: absolute;
                top: calc(100% + 12px);
                right: 0;
                background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(0, 0, 0, 0.95) 100%);
                backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 8px;
                min-width: 200px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px) scale(0.95);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                z-index: 1000;
            `;
        } else {
            this.dropdown.style.cssText = `
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                margin: 8px 20px 0;
            `;
        }

        // Estiliza as opções
        const options = this.dropdown.querySelectorAll('.language-option');
        options.forEach((option, index) => {
            option.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 15px;
                font-weight: 500;
                position: relative;
                overflow: hidden;
            `;

            // Adiciona bandeira animada
            const flag = option.querySelector('.flag');
            if (flag) {
                flag.style.cssText = `
                    font-size: 20px;
                    transition: transform 0.3s ease;
                `;
            }

            option.addEventListener('mouseenter', () => {
                option.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)';
                option.style.transform = 'translateX(6px)';
                option.style.color = '#ffffff';
                if (flag) flag.style.transform = 'scale(1.2) rotate(10deg)';
            });

            option.addEventListener('mouseleave', () => {
                option.style.background = 'transparent';
                option.style.transform = 'translateX(0)';
                option.style.color = 'rgba(255, 255, 255, 0.9)';
                if (flag) flag.style.transform = 'scale(1) rotate(0deg)';
            });

            // Feedback de clique
            option.addEventListener('click', () => {
                option.style.transform = 'translateX(6px) scale(0.95)';
                option.style.background = 'rgba(255, 255, 255, 0.3)';

                setTimeout(() => {
                    option.style.transform = 'scale(1)';
                }, 100);
            });
        });

        // Adiciona seta animada
        this.createArrow();
    }

    createArrow() {
        const arrowClass = this.isDesktop ? 'arrow' : 'arrow-mobile';
        let arrow = this.button.querySelector(`.${arrowClass}`);

        if (!arrow) {
            arrow = document.createElement('span');
            arrow.className = arrowClass;
            arrow.innerHTML = '▼';
            arrow.style.cssText = `
                font-size: 10px;
                margin-left: auto;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                display: inline-block;
                opacity: 0.7;
            `;
            this.button.appendChild(arrow);
        }
        return arrow;
    }

    attachEvents() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Fechar ao clicar fora (apenas desktop)
        if (this.isDesktop) {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.language-selector') && this.isOpen) {
                    this.close();
                }
            });
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.button.classList.add('active');
        this.dropdown.classList.add('active');

        const arrow = this.button.querySelector(this.isDesktop ? '.arrow' : '.arrow-mobile');

        if (this.isDesktop) {
            // Animação desktop
            this.dropdown.style.opacity = '1';
            this.dropdown.style.visibility = 'visible';
            this.dropdown.style.transform = 'translateY(0) scale(1)';

            if (arrow) {
                arrow.style.transform = 'rotate(180deg)';
                arrow.style.opacity = '1';
            }

            this.button.style.background = 'rgba(255, 255, 255, 0.12)';
            this.button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

            // Anima as opções com stagger
            const options = this.dropdown.querySelectorAll('.language-option');
            options.forEach((option, index) => {
                option.style.opacity = '0';
                option.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                    option.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    option.style.opacity = '1';
                    option.style.transform = 'translateX(0)';
                }, 50 * (index + 1));
            });

            this.pulseBorder();

        } else {
            // Animação mobile
            this.dropdown.style.maxHeight = '300px';
            this.dropdown.style.padding = '8px 0';

            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }

        console.log(`🌍 Idiomas ${this.isDesktop ? 'Desktop' : 'Mobile'} ABERTO`);
    }

    close() {
        this.isOpen = false;
        this.button.classList.remove('active');
        this.dropdown.classList.remove('active');

        const arrow = this.button.querySelector(this.isDesktop ? '.arrow' : '.arrow-mobile');

        if (this.isDesktop) {
            this.dropdown.style.opacity = '0';
            this.dropdown.style.visibility = 'hidden';
            this.dropdown.style.transform = 'translateY(-10px) scale(0.95)';

            if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
                arrow.style.opacity = '0.7';
            }

            this.button.style.background = 'transparent';
            this.button.style.boxShadow = 'none';
        } else {
            this.dropdown.style.maxHeight = '0';
            this.dropdown.style.padding = '0';

            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }

        console.log(`🌍 Idiomas ${this.isDesktop ? 'Desktop' : 'Mobile'} FECHADO`);
    }

    pulseBorder() {
        if (!this.isOpen || !this.isDesktop) return;

        this.dropdown.style.borderColor = 'rgba(255, 255, 255, 0.3)';

        setTimeout(() => {
            if (!this.isOpen) return;
            this.dropdown.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            setTimeout(() => this.pulseBorder(), 2000);
        }, 1000);
    }
}

// ============================================================================
// 4. CSS ADICIONAL PARA ANIMAÇÕES
// ============================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .dropdown-menu a::before,
    .language-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: width 0.3s ease;
    }
    
    .dropdown-menu a:hover::before,
    .language-option:hover::before {
        width: 100%;
    }
`;
document.head.appendChild(style);

// ============================================================================
// 5. EFEITO PARALLAX (60 FPS OTIMIZADO)
// ============================================================================

const parallaxSections = [
    { element: document.querySelector('.parallax-section'), speed: 0.5 }
];

let parallaxTicking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;

    parallaxSections.forEach(section => {
        if (section.element) {
            const rect = section.element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > -200;

            if (isVisible) {
                const yPos = -(scrolled * section.speed);

                if (section.element.classList.contains('parallax-section')) {
                    const bg = section.element.querySelector('.parallax-bg');
                    if (bg) {
                        bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    }
                }
            }
        }
    });

    parallaxTicking = false;
}

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
    }
}, { passive: true });

// ============================================================================
// 6. NAVBAR COM SCROLL (HIDE/SHOW)
// ============================================================================

let lastScrollTop = 0;
const navbar = document.getElementById('navbar');
let navbarTicking = false;

function updateNavbar() {
    const scrollTop = window.pageYOffset;

    // Adiciona classe "scrolled" após 50px
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Esconde navbar ao rolar para baixo
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
    navbarTicking = false;
}

if (navbar) {
    window.addEventListener('scroll', () => {
        if (!navbarTicking) {
            requestAnimationFrame(updateNavbar);
            navbarTicking = true;
        }
    }, { passive: true });
}

// ============================================================================
// 7. SCROLL REVEAL (INTERSECTION OBSERVER)
// ============================================================================

const observerOptions = {
    threshold: 0.15,
    rootMargin: '50px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.classList.add('active');
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// ============================================================================
// 8. EXPANDIR/COLAPSAR CARDS DE PARCEIROS
// ============================================================================

function toggleInfo(partnerId) {
    const card = document.querySelector(`.collab-card[data-partner="${partnerId}"]`);
    if (card) {
        requestAnimationFrame(() => {
            card.classList.toggle('expanded');

            const btn = card.querySelector('.collab-btn .btn-text');
            if (btn) {
                btn.textContent = card.classList.contains('expanded') ? 'Ver Menos' : 'Ver Mais';
            }
        });
    }
}

// ============================================================================
// 9. LOADING SCREEN PROFISSIONAL
// ============================================================================

const messages = [
    "Preparando uma experiência de transformação social através da educação e cultura.",
    "Conectando comunidades e oportunidades para um futuro mais inclusivo.",
    "Ampliando vozes e criando pontes entre a periferia e o mercado de trabalho.",
    "Desenvolvendo soluções inovadoras com impacto social real e mensurável."
];

let currentMessageIndex = 0;

function updateMessage(index) {
    const messageEl = document.getElementById('loadingMessage');
    const statusEl = document.getElementById('progressStatus');

    if (!messageEl || !statusEl) return;

    messageEl.style.opacity = '0';
    statusEl.style.opacity = '0';

    setTimeout(() => {
        messageEl.textContent = messages[index];
        const statuses = ["Inicializando", "Carregando", "Processando", "Quase pronto"];
        statusEl.textContent = statuses[index] || "Carregando";
        messageEl.style.opacity = '1';
        statusEl.style.opacity = '1';
    }, 400);
}

function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 12 : 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '0';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';
        particle.style.setProperty('--x-drift', (Math.random() * 40 - 20) + 'px');

        container.appendChild(particle);
    }
}

function simulateLoading() {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');

    if (!progressBar || !progressPercent) return;

    let progress = 0;
    let messageStage = 0;
    const totalDuration = 500;
    const updateInterval = 30;
    const totalSteps = totalDuration / updateInterval;
    const incrementPerStep = 100 / totalSteps;

    const interval = setInterval(() => {
        progress += incrementPerStep;

        // Atualiza mensagens conforme progresso
        if (progress >= 25 && messageStage === 0) {
            updateMessage(1);
            messageStage = 1;
        } else if (progress >= 50 && messageStage === 1) {
            updateMessage(2);
            messageStage = 2;
        } else if (progress >= 75 && messageStage === 2) {
            updateMessage(3);
            messageStage = 3;
        }

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            const statusEl = document.getElementById('progressStatus');
            if (statusEl) statusEl.textContent = "Concluído";

            setTimeout(finishLoading, 300);
        }

        progressBar.style.width = progress + '%';
        progressPercent.textContent = Math.floor(progress) + '%';
    }, updateInterval);
}

function finishLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    // Efeito de explosão nas partículas
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        const explodeX = (Math.random() - 0.5) * 400;
        const explodeY = (Math.random() - 0.5) * 400;
        particle.style.setProperty('--explode-x', explodeX + 'px');
        particle.style.setProperty('--explode-y', explodeY + 'px');
    });

    loadingScreen.classList.add('fade-out');

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (typeof window.onLoadingComplete === 'function') {
            window.onLoadingComplete();
        }
    }, 1200);
}

// Inicialização do loading
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    simulateLoading();
});

// Recriar partículas ao redimensionar
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const container = document.getElementById('particlesContainer');
        if (container) {
            container.innerHTML = '';
            createParticles();
        }
    }, 300);
});

// ============================================================================
// 10. SCROLL SUAVE PARA LINKS ÂNCORA
// ============================================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#redesSociais') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================================================
// 11. OTIMIZAÇÃO DE PERFORMANCE
// ============================================================================

// Desabilitar hover effects durante scroll
let scrollTimer;
window.addEventListener('scroll', () => {
    document.body.classList.add('disable-hover');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        document.body.classList.remove('disable-hover');
    }, 100);
}, { passive: true });

// Prefetch de imagens críticas
window.addEventListener('DOMContentLoaded', () => {
    const criticalImages = [
        './b597265b-fa26-4f20-be46-7b3664a55581.jpg',
        './541196910_18040398023659900_1243440542592817163_n.jpg'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = src;
        document.head.appendChild(link);
    });
});

// ============================================================================
// 12. ANIMAÇÃO DOS FUNDADORES
// ============================================================================

function iniciarAnimacaoFundadores() {
    const fundadoresSection = document.querySelector('.fundadores-section');

    if (!fundadoresSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animar título
                const titulo = fundadoresSection.querySelector('h2');
                if (titulo) {
                    setTimeout(() => titulo.classList.add('ativo'), 100);
                }

                // Animar cards
                const cards = fundadoresSection.querySelectorAll('.swiper-slide');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('ativo');
                    }, 300 + (index * 200));
                });

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    observer.observe(fundadoresSection);
}

// Executar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAnimacaoFundadores);
} else {
    iniciarAnimacaoFundadores();
}

setTimeout(iniciarAnimacaoFundadores, 1000);

// ============================================================================
// 13. BOTÃO "VOLTAR AO TOPO"
// ============================================================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function () {
    const backToTopBtn = document.getElementById('backToTopBtn');
    const footer = document.querySelector('footer');

    if (!footer || !backToTopBtn) return;

    const footerPosition = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (footerPosition <= windowHeight) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// ============================================================================
// 14. CARROSSEL MOBILE OFICINAS
// ============================================================================

let oficinasNext = document.querySelector('.oficinas-next');
let oficinasPrev = document.querySelector('.oficinas-prev');

if (oficinasNext && oficinasPrev) {
    oficinasNext.addEventListener('click', function () {
        let items = document.querySelectorAll('.oficinas-item');
        if (items.length > 0) {
            document.querySelector('.oficinas-slide').appendChild(items[0]);
        }
    });

    oficinasPrev.addEventListener('click', function () {
        let items = document.querySelectorAll('.oficinas-item');
        if (items.length > 0) {
            document.querySelector('.oficinas-slide').prepend(items[items.length - 1]);
        }
    });
}

// ============================================================================
// 15. SWIPER (DEPOIMENTOS/FUNDADORES)
// ============================================================================

const swiper = new Swiper('.mySwiper', {
    slidesPerView: 1.15,
    spaceBetween: 15,
    centeredSlides: false,
    autoHeight: true,
    loop: false,
    navigation: {
        nextEl: '#nextBtnTestimonials',
        prevEl: '#prevBtnTestimonials',
    },
    breakpoints: {
        768: {
            enabled: false,
            slidesPerView: 3,
            spaceBetween: 20,
        }
    }
});

// ============================================================================
// 16. SISTEMA DE TRADUÇÕES
// ============================================================================

const translations = {
    pt: {
        navHome: 'Início',
        navFounders: 'Fundadores',
        navWhoWeAre: 'Quem Somos',
        navObjective: 'Objetivo',
        navWorkshops: 'Oficinas',
        navPartners: 'Galeria',
        navMyAccount: 'Minha Conta',
        navRegister: 'Se Inscreva',
        navLogin: 'Login',
        navProfile: 'Perfil',
        navContact: 'Contato',
        navLanguage: 'Idioma',
        loadingTitle: 'Vozes da Periferia',
        loadingSubtitle: 'Carregando',
        loadingStatus: 'Inicializando',
        loadingMessage: 'Preparando uma experiência de transformação social através da educação e cultura.',
        loadingMessage2: 'Conectando comunidades e oportunidades para um futuro mais inclusivo.',
        loadingMessage3: 'Ampliando vozes e criando pontes entre a periferia e o mercado de trabalho.',
        loadingMessage4: 'Desenvolvendo soluções inovadoras com impacto social real e mensurável.',
        brandTagline: 'Educação • Cultura • Transformação',
        brandCopyright: '© 2026 Vozes da Periferia',
        loadingStatusInit: 'Inicializando',
        loadingStatusLoad: 'Carregando',
        loadingStatusProcess: 'Processando',
        loadingStatusReady: 'Quase pronto',
        loadingStatusComplete: 'Concluído',
        mainTitle: 'PROJETO VOZES DA PERIFERIA',
        subtitle: 'Pão dos Pobres',
        headerDesc: 'Um movimento de jovens comprometidos com a transformação social através da educação, cultura e oportunidades.',
        heroImageAlt: 'Jovens da comunidade',
        foundersTitle: 'Fundadores',
        founder1Name: 'Eicon Gustavo',
        founder1Desc: 'Fundador e um dos idealizadores do projeto, responsável por definir a estratégia e pela condução das rodas de conversa.',
        founder1Role: 'Fundador',
        founder2Name: 'Guilherme Martins',
        founder2Desc: 'Fundador, responsável pela organização, gestão de colaboradores e direção criativa do projeto.',
        founder2Role: 'Fundador',
        founder3Name: 'Luis da Silva',
        founder3Desc: 'Estratégia e comunicação para levar nossa representatividade a empresas e escolas, gerando impacto e transformação real.',
        founder3Role: 'Fundador',
        whoWeAreTitle: 'Quem Somos',
        whoWeAreText: 'Somos um movimento impulsionado por jovens negros e periféricos, focado em levar educação, cultura e empregabilidade para dentro das escolas e do mundo corporativo. Mais do que apenas estar lá, atuamos como uma ponte estratégica entre a potência criativa da quebrada e as demandas do mercado. Usamos nossa identidade e a cultura de rua como ferramentas de inovação, transformando realidades e criando novas perspectivas de futuro.',
        parallaxTitle: 'Juntos Construímos o Futuro',
        parallaxText: 'Inovação, dedicação e trabalho em equipe',
        objectiveTitle: 'Nosso Objetivo',
        objectiveText: 'Nosso objetivo é levar aprendizado e representatividade negra periférica para escolas, comunidades e o mercado de trabalho, conscientizando jovens na luta contra o racismo. Criamos pontes de oportunidades reais através da educação, cultura e tecnologia. Queremos formar novos líderes orgulhosos de sua identidade, prontos para transformar suas realidades e ocupar espaços de poder e decisão com protagonismo.',
        workshopsTitle: 'Oficinas e Atividades',
        workshop1Title: 'Manutenção de Computadores',
        workshop1Desc: 'Do zero ao profissional: aprenda montagem, manutenção e diagnóstico de computadores. Habilidades práticas que abrem portas no mercado de tecnologia e geram oportunidades reais de trabalho e renda.',
        workshop1Tag1: 'Hardware',
        workshop1Tag2: 'Software',
        workshop1Alt: 'Manutenção de Computadores',
        workshop2Title: 'Tecnologia Inclusiva',
        workshop2Desc: 'Quebrando barreiras digitais: levamos tecnologia e inclusão para quem mais precisa. Capacitação prática em informática que transforma vidas e abre portas para o mundo digital e suas oportunidades.',
        workshop2Tag1: 'Inclusão',
        workshop2Tag2: 'Digital',
        workshop2Alt: 'Tecnologia Inclusiva',
        workshop3Title: 'Raízes Afro-Gaúchas',
        workshop3Desc: 'Resgate e celebração da cultura afro-gaúcha: reconectamos com nossas raízes, fortalecemos identidades e promovemos orgulho negro. Conhecimento ancestral que empodera e transforma nossa relação com história e pertencimento.',
        workshop3Tag1: 'Cultura',
        workshop3Tag2: 'Raízes',
        workshop3Alt: 'Cultura Negra Gaúcha',
        workshop4Title: 'Hip Hop é Resistência',
        workshop4Desc: 'Hip Hop como ferramenta de transformação: damos voz, empoderamos e revolucionamos a juventude periférica. Arte, cultura e resistência que constroem identidade, autoestima e abrem caminhos para expressão e protagonismo social.',
        workshop4Tag1: 'Arte',
        workshop4Tag2: 'Voz',
        workshop4Alt: 'Movimento Hip Hop',
        workshop5Title: 'Diálogos que Mudam',
        workshop5Desc: 'Escuta ativa e troca de vivências: construímos soluções coletivas através do diálogo. Rodas de conversa que fortalecem vínculos, compartilham experiências e criam caminhos reais para um futuro mais justo e transformador.',
        workshop5Tag1: 'Diálogo',
        workshop5Tag2: 'União',
        workshop5Alt: 'Rodas de Conversa',
        workshop6Title: 'Gerações Conectadas',
        workshop6Desc: 'Unindo gerações através da tecnologia: ensinamos idosos a navegar no mundo digital com respeito e paciência. Inclusão digital que valoriza sabedoria, fortalece vínculos familiares e conecta corações através das telas e aplicativos.',
        workshop6Tag1: 'Gerações',
        workshop6Tag2: 'Respeito',
        workshop6Alt: 'Inclusão Digital Sênior',
        partnersTitle: 'Parceiros e Colaboradores',
        partner1Name: 'Projeto Aruanda',
        partner1Desc: 'O Aruanda é um projeto de estratégia e comunicação que atua como ponte entre a representatividade e os espaços de decisão. Ele transforma a presença negra e periférica em impacto real, levando vozes e narrativas de transformação para dentro de empresas e salas de aula para mudar as instituições por dentro.',
        partner1Alt: 'Projeto Aruanda',
        partner2Name: 'Museu do Hip Hop',
        partner2Desc: 'Preservando e celebrando a história do Hip Hop gaúcho. Um espaço cultural dedicado a documentar a trajetória do movimento no Rio Grande do Sul, valorizando artistas locais e promovendo a cultura periférica como patrimônio cultural legítimo e transformador.',
        partner2Alt: 'Museu Hip Hop',
        partner3Name: 'Rodrigo Sabiah',
        partner3Desc: 'Artista, ativista e produtor cultural comprometido com a democratização da arte periférica. Através de projetos inovadores, Rodrigo Sabiah trabalha pela valorização da produção cultural das comunidades, criando pontes entre periferia e centro na luta por reconhecimento e representatividade.',
        partner3Alt: 'Rodrigo Sabiah',
        partner4Name: 'Pão dos Pobres',
        partner4Desc: 'A Fundação O Pão dos Pobres de Santo Antônio é uma instituição centenária e referência em assistência social e educação profissional em Porto Alegre. Fundada em 1895, ela atua na linha de frente da transformação social, oferecendo acolhimento, proteção e, principalmente, cursos de aprendizagem profissional para jovens em situação de vulnerabilidade.',
        partner4Alt: 'Fundação Pão dos Pobres',
        seeMore: 'Ver Mais',
        seeLess: 'Ver Menos',
        learnMore: 'Saiba Mais',
        // ← VÍRGULA ESTAVA FALTANDO AQUI EMBAIXO
        galleryHeading: 'NOSSA',
        galleryHeadingSpan: 'GALERIA',
        gallerySub: 'MOMENTOS QUE CONTAM A NOSSA HISTÓRIA',
        aboutUs: 'Sobre Nós',
        aboutText: 'Vozes da Periferia é um projeto dedicado a transformar vidas através da educação e cultura. Acreditamos no poder da comunidade e trabalhamos para amplificar as vozes que muitas vezes não são ouvidas.',
        teamSign: '- Equipe Vozes da Periferia',
        connectUs: 'Conecte-se Conosco',
        followInsta: 'Siga no Instagram',
        whatsapp: 'Fale no WhatsApp',
        sendEmail: 'Envie um Email',
        ourLocation: 'Nossa Localização',
        copyright: '© 2026 Vozes da Periferia - Todos os direitos reservados',
        footerCredits: 'Dando voz a quem mais precisa ser ouvido.',
        backToTop: 'Topo',
        loading: 'Carregando',
        previousWorkshop: 'ANTERIOR',
        nextWorkshop: 'PRÓXIMO',
        galleryPause: 'PAUSAR',
        galleryPlay: 'PLAY',
        openMenu: 'Abrir menu de navegação',
        selectLanguage: 'Selecionar idioma',
        close: 'Fechar',
        viewMore: 'Ver mais',
        viewLess: 'Ver menos'
    },

    en: {
        navHome: 'Home',
        navFounders: 'Founders',
        navWhoWeAre: 'Who We Are',
        navObjective: 'Objective',
        navWorkshops: 'Workshops',
        navPartners: 'Partners',
        navMyAccount: 'My Account',
        navRegister: 'Sign Up',
        navLogin: 'Login',
        navProfile: 'Profile',
        navContact: 'Contact',
        navLanguage: 'Language',
        loadingTitle: 'Voices from the Periphery',
        loadingSubtitle: 'Loading',
        loadingStatus: 'Initializing',
        loadingMessage: 'Preparing an experience of social transformation through education and culture.',
        loadingMessage2: 'Connecting communities and opportunities for a more inclusive future.',
        loadingMessage3: 'Amplifying voices and building bridges between the periphery and the job market.',
        loadingMessage4: 'Developing innovative solutions with real and measurable social impact.',
        brandTagline: 'Education • Culture • Transformation',
        brandCopyright: '© 2026 Voices from the Periphery',
        loadingStatusInit: 'Initializing',
        loadingStatusLoad: 'Loading',
        loadingStatusProcess: 'Processing',
        loadingStatusReady: 'Almost ready',
        loadingStatusComplete: 'Complete',
        mainTitle: 'VOICES FROM THE PERIPHERY PROJECT',
        subtitle: 'Bread of the Poor',
        headerDesc: 'A movement of young people committed to social transformation through education, culture, and opportunities.',
        heroImageAlt: 'Community youth',
        foundersTitle: 'Founders',
        founder1Name: 'Eicon Gustavo',
        founder1Desc: 'Founder and one of the project ideators, responsible for defining strategy and conducting conversation circles.',
        founder1Role: 'Founder',
        founder2Name: 'Guilherme Martins',
        founder2Desc: 'Founder, responsible for organization, collaborator management, and creative direction of the project.',
        founder2Role: 'Founder',
        founder3Name: 'Luis da Silva',
        founder3Desc: 'Strategy and communication to bring our representation to companies and schools, generating real impact and transformation.',
        founder3Role: 'Founder',
        whoWeAreTitle: 'Who We Are',
        whoWeAreText: 'We are a movement driven by young Black people from the periphery, focused on bringing education, culture, and employability to schools and the corporate world. More than just being there, we act as a strategic bridge between the creative power of the streets and market demands. We use our identity and street culture as innovation tools, transforming realities and creating new future perspectives.',
        parallaxTitle: 'Together We Build the Future',
        parallaxText: 'Innovation, dedication and teamwork',
        objectiveTitle: 'Our Objective',
        objectiveText: 'Our goal is to bring learning and Black peripheral representation to schools, communities, and the job market, raising awareness among youth in the fight against racism. We create bridges of real opportunities through education, culture, and technology. We want to form new leaders proud of their identity, ready to transform their realities and occupy spaces of power and decision-making with protagonism.',
        workshopsTitle: 'Workshops and Activities',
        workshop1Title: 'Computer Maintenance',
        workshop1Desc: 'From zero to professional: learn computer assembly, maintenance, and diagnostics. Practical skills that open doors in the technology market and generate real work and income opportunities.',
        workshop1Tag1: 'Hardware',
        workshop1Tag2: 'Software',
        workshop1Alt: 'Computer Maintenance',
        workshop2Title: 'Inclusive Technology',
        workshop2Desc: 'Breaking digital barriers: we bring technology and inclusion to those who need it most. Practical computer training that transforms lives and opens doors to the digital world and its opportunities.',
        workshop2Tag1: 'Inclusion',
        workshop2Tag2: 'Digital',
        workshop2Alt: 'Inclusive Technology',
        workshop3Title: 'Afro-Gaucho Roots',
        workshop3Desc: 'Rescue and celebration of Afro-Gaucho culture: we reconnect with our roots, strengthen identities, and promote Black pride. Ancestral knowledge that empowers and transforms our relationship with history and belonging.',
        workshop3Tag1: 'Culture',
        workshop3Tag2: 'Roots',
        workshop3Alt: 'Black Gaucho Culture',
        workshop4Title: 'Hip Hop is Resistance',
        workshop4Desc: 'Hip Hop as a transformation tool: we give voice, empower, and revolutionize peripheral youth. Art, culture, and resistance that build identity, self-esteem, and open paths for expression and social protagonism.',
        workshop4Tag1: 'Art',
        workshop4Tag2: 'Voice',
        workshop4Alt: 'Hip Hop Movement',
        workshop5Title: 'Dialogues that Change',
        workshop5Desc: 'Active listening and sharing experiences: we build collective solutions through dialogue. Conversation circles that strengthen bonds, share experiences, and create real paths to a fairer and transformative future.',
        workshop5Tag1: 'Dialogue',
        workshop5Tag2: 'Unity',
        workshop5Alt: 'Conversation Circles',
        workshop6Title: 'Connected Generations',
        workshop6Desc: 'Uniting generations through technology: we teach seniors to navigate the digital world with respect and patience. Digital inclusion that values wisdom, strengthens family bonds, and connects hearts through screens and apps.',
        workshop6Tag1: 'Generations',
        workshop6Tag2: 'Respect',
        workshop6Alt: 'Senior Digital Inclusion',
        partnersTitle: 'Partners and Collaborators',
        partner1Name: 'Aruanda Project',
        partner1Desc: 'Aruanda is a strategy and communication project that acts as a bridge between representation and decision-making spaces. It transforms Black and peripheral presence into real impact, bringing voices and transformation narratives into companies and classrooms to change institutions from within.',
        partner1Alt: 'Aruanda Project',
        partner2Name: 'Hip Hop Museum',
        partner2Desc: "Preserving and celebrating the history of Gaucho Hip Hop. A cultural space dedicated to documenting the movement's trajectory in Rio Grande do Sul, valuing local artists and promoting peripheral culture as legitimate and transformative cultural heritage.",
        partner2Alt: 'Hip Hop Museum',
        partner3Name: 'Rodrigo Sabiah',
        partner3Desc: 'Artist, activist, and cultural producer committed to democratizing peripheral art. Through innovative projects, Rodrigo Sabiah works to value the cultural production of communities, creating bridges between periphery and center in the fight for recognition and representation.',
        partner3Alt: 'Rodrigo Sabiah',
        partner4Name: 'Bread of the Poor',
        partner4Desc: 'The O Pão dos Pobres de Santo Antônio Foundation is a centenary institution and reference in social assistance and professional education in Porto Alegre. Founded in 1895, it works on the front line of social transformation, offering shelter, protection, and especially professional learning courses for vulnerable youth.',
        partner4Alt: 'Bread of the Poor Foundation',
        seeMore: 'See More',
        seeLess: 'See Less',
        learnMore: 'Learn More',
        galleryHeading: 'OUR',
        galleryHeadingSpan: 'GALLERY',
        gallerySub: 'MOMENTS THAT TELL OUR STORY',
        aboutUs: 'About Us',
        aboutText: 'Voices from the Periphery is a project dedicated to transforming lives through education and culture. We believe in the power of community and work to amplify voices that often go unheard.',
        teamSign: '- Voices from the Periphery Team',
        connectUs: 'Connect With Us',
        followInsta: 'Follow on Instagram',
        whatsapp: 'Talk on WhatsApp',
        sendEmail: 'Send an Email',
        ourLocation: 'Our Location',
        copyright: '© 2026 Voices from the Periphery - All rights reserved',
        footerCredits: 'Giving a voice to those who need to be heard.',
        backToTop: 'Top',
        loading: 'Loading',
        previousWorkshop: 'PREVIOUS',
        nextWorkshop: 'NEXT',
        galleryPause: 'PAUSE',
        galleryPlay: 'PLAY',
        openMenu: 'Open navigation menu',
        selectLanguage: 'Select language',
        close: 'Close',
        viewMore: 'View more',
        viewLess: 'View less'
    }
};

const languageData = {
    pt: { name: 'Português', flag: '🇧🇷' },
    en: { name: 'English', flag: '🇺🇸' },
};

let currentLanguage = 'pt';

// ============================================================================
// 17. FUNÇÃO DE TRADUÇÃO
// ============================================================================

function translatePage(lang) {
    const t = translations[lang];
    if (!t) return;

    // NAVEGAÇÃO
    const navItems = document.querySelectorAll('.nav-menu > li');
    if (navItems[0]) { const l = navItems[0].querySelector('a'); if (l) l.textContent = t.navHome; }
    if (navItems[1]) { const l = navItems[1].querySelector('a'); if (l) l.textContent = t.navFounders; }
    if (navItems[2]) { const l = navItems[2].querySelector('a'); if (l) l.textContent = t.navWhoWeAre; }
    if (navItems[3]) { const l = navItems[3].querySelector('a'); if (l) l.textContent = t.navObjective; }
    if (navItems[4]) { const l = navItems[4].querySelector('a'); if (l) l.textContent = t.navWorkshops; }
    if (navItems[5]) { const l = navItems[5].querySelector('a'); if (l) l.textContent = t.navPartners; }
    if (navItems[7]) { const l = navItems[7].querySelector('a'); if (l) l.textContent = t.navContact; }

    const myAccountBtn = document.querySelector('.dropdown-toggle');
    if (myAccountBtn) {
        myAccountBtn.childNodes.forEach(node => {
            if (node.nodeType === 3) node.textContent = t.navMyAccount + ' ';
        });
    }

    const dropdownItems = document.querySelectorAll('.dropdown-menu a');
    if (dropdownItems[0]) dropdownItems[0].textContent = t.navRegister;
    if (dropdownItems[1]) dropdownItems[1].textContent = t.navLogin;
    if (dropdownItems[2]) dropdownItems[2].textContent = t.navProfile;

    // HERO
    const mainTitle = document.querySelector('.header-text h1');
    if (mainTitle) mainTitle.textContent = t.mainTitle;
    const subtitle = document.querySelector('.subtitle1');
    if (subtitle) subtitle.textContent = t.subtitle;
    const headerDesc = document.querySelector('.header-description');
    if (headerDesc) headerDesc.textContent = t.headerDesc;

    // FUNDADORES
    const foundersSection = document.querySelector('.fundadores-section');
    if (foundersSection) {
        const foundersTitle = foundersSection.querySelector('h2');
        if (foundersTitle) foundersTitle.textContent = t.foundersTitle;
        setTimeout(() => {
            foundersSection.querySelectorAll('.swiper-slide').forEach((slide, index) => {
                const num = index + 1;
                const el1 = slide.querySelector('.testimonial-text');
                const el2 = slide.querySelector('.author-name');
                const el3 = slide.querySelector('.author-role');
                if (el1) el1.textContent = t[`founder${num}Desc`];
                if (el2) el2.textContent = t[`founder${num}Name`];
                if (el3) el3.textContent = t[`founder${num}Role`];
            });
        }, 100);
    }

    // QUEM SOMOS
    const whoWeAreSection = document.getElementById('quem-somos');
    if (whoWeAreSection) {
        const whoTitle = whoWeAreSection.querySelector('h2');
        if (whoTitle) whoTitle.textContent = t.whoWeAreTitle;
        const whoText = whoWeAreSection.querySelector('.objective-box p');
        if (whoText) whoText.textContent = t.whoWeAreText;
    }

    // PARALLAX
    const parallaxTitle = document.querySelector('.parallax-title');
    if (parallaxTitle) parallaxTitle.textContent = t.parallaxTitle;
    const parallaxText = document.querySelector('.parallax-text');
    if (parallaxText) parallaxText.textContent = t.parallaxText;

    // OBJETIVO
    const objectiveSection = document.getElementById('objetivo');
    if (objectiveSection) {
        const objTitle = objectiveSection.querySelector('h2');
        if (objTitle) objTitle.textContent = t.objectiveTitle;
        const objText = objectiveSection.querySelector('.objective-box p');
        if (objText) objText.textContent = t.objectiveText;
    }

    // OFICINAS
    const workshopsSection = document.getElementById('oficinas');
    if (workshopsSection) {
        const workshopsTitle = workshopsSection.querySelector('h2');
        if (workshopsTitle) workshopsTitle.textContent = t.workshopsTitle;
        workshopsSection.querySelectorAll('.oficina-card-item').forEach((card, index) => {
            const num = index + 1;
            const title = card.querySelector('.oficina-title');
            const desc = card.querySelector('.oficina-description');
            const tags = card.querySelectorAll('.oficina-tag');
            if (title) title.textContent = t[`workshop${num}Title`];
            if (desc) desc.textContent = t[`workshop${num}Desc`];
            if (tags[0]) tags[0].textContent = t[`workshop${num}Tag1`];
            if (tags[1]) tags[1].textContent = t[`workshop${num}Tag2`];
        });
        workshopsSection.querySelectorAll('.oficinas-item').forEach((item, index) => {
            const num = index + 1;
            const name = item.querySelector('.oficinas-item-name');
            const desc = item.querySelector('.oficinas-item-desc');
            if (name) name.textContent = t[`workshop${num}Title`];
            if (desc) desc.textContent = t[`workshop${num}Desc`];
        });
    }

    // PARCEIROS
    const partnersSection = document.getElementById('parceiros');
    if (partnersSection) {
        const partnersTitle = partnersSection.querySelector('h2');
        if (partnersTitle) partnersTitle.textContent = t.partnersTitle;
        partnersSection.querySelectorAll('.collab-card').forEach((card, index) => {
            const num = index + 1;
            const name = card.querySelector('.collab-name');
            const desc = card.querySelector('.collab-description');
            if (name) name.textContent = t[`partner${num}Name`];
            if (desc) desc.textContent = t[`partner${num}Desc`];
        });
        partnersSection.querySelectorAll('.collab-btn').forEach(btn => {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = btn.closest('.collab-card').classList.contains('expanded') ? t.seeLess : t.seeMore;
        });
        partnersSection.querySelectorAll('.collab-link-btn').forEach(btn => btn.textContent = t.learnMore);
    }

    // ========== GALERIA ← ESTAVA FALTANDO ISSO ==========
    const galleryHeading = document.querySelector('.c3d-heading');
    if (galleryHeading) {
        galleryHeading.innerHTML = `${t.galleryHeading} <span>${t.galleryHeadingSpan}</span>`;
    }
    const gallerySub = document.querySelector('.c3d-sub');
    if (gallerySub) gallerySub.textContent = t.gallerySub;

    const prevBtn = document.getElementById('c3dPrev');
    if (prevBtn) prevBtn.innerHTML = `← <span class="c3d-lbl">${t.previousWorkshop}</span>`;

    const nextBtn = document.getElementById('c3dNext');
    if (nextBtn) nextBtn.innerHTML = `<span class="c3d-lbl">${t.nextWorkshop}</span> →`;

    const playBtnGal = document.getElementById('c3dPlay');
    if (playBtnGal) {
        const isPlaying = playBtnGal.innerHTML.includes('⏸');
        playBtnGal.innerHTML = isPlaying
            ? `⏸ <span class="c3d-lbl">${t.galleryPause}</span>`
            : `▶ <span class="c3d-lbl">${t.galleryPlay}</span>`;
    }

    // FOOTER
    const footerSections = document.querySelectorAll('.footer-section h3');
    if (footerSections[0]) footerSections[0].textContent = t.aboutUs;
    if (footerSections[1]) footerSections[1].textContent = t.connectUs;
    if (footerSections[2]) footerSections[2].textContent = t.ourLocation;

    const aboutText = document.querySelector('.footer-section .about-text');
    if (aboutText) aboutText.textContent = t.aboutText;
    const teamSign = document.querySelector('.about-signature');
    if (teamSign) teamSign.textContent = t.teamSign;

    const socialTexts = document.querySelectorAll('.social-text');
    if (socialTexts[0]) socialTexts[0].textContent = t.followInsta;
    if (socialTexts[1]) socialTexts[1].textContent = t.whatsapp;
    if (socialTexts[2]) socialTexts[2].textContent = t.sendEmail;

    const copyright = document.querySelector('.footer-text');
    if (copyright) copyright.textContent = t.copyright;
    const footerCredits = document.querySelector('.footer-credits');
    if (footerCredits) footerCredits.textContent = t.footerCredits;
}

// ============================================================================
// 18. PERSISTÊNCIA DE IDIOMA
// ============================================================================

function saveLanguagePreference(lang) {
    try {
        localStorage.setItem('selectedLanguage', lang);
        localStorage.setItem('lang', lang);
    } catch (e) {
        console.warn('Não foi possível salvar preferência de idioma:', e);
    }
}

function loadLanguagePreference() {
    try {
        const savedLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('lang');
        if (savedLang && translations[savedLang]) {
            currentLanguage = savedLang;
            translatePage(savedLang);

            const currentFlag = document.getElementById('currentFlag');
            const currentLangText = document.getElementById('currentLang');
            if (currentFlag) currentFlag.textContent = languageData[savedLang].flag;
            if (currentLangText) currentLangText.textContent = languageData[savedLang].name;

            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.lang === savedLang);
            });
        }
    } catch (e) {
        console.warn('Não foi possível carregar preferência de idioma:', e);
    }
}
// ============================================================================
// 19. TOGGLE DO BACKGROUND (MINHA CONTA E IDIOMAS) - APENAS DESKTOP
// ============================================================================

class BackgroundToggle {
    constructor() {
        this.isDown = false;
        this.homeSection = null;
        this.buttons = {
            languageDesktop: null,
            languageMobile: null,
            myAccount: null
        };

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.homeSection = document.getElementById('home');
        this.buttons.languageDesktop = document.querySelector('.language-btn');
        this.buttons.languageMobile = document.querySelector('.language-btn-mobile');
        this.buttons.myAccount = document.querySelector('.dropdown-toggle');

        if (!this.homeSection) {
            console.warn('⚠️ Seção #home não encontrada');
            return;
        }

        this.logElementsStatus();
        this.attachEventListeners();

        console.log('✅ Sistema de toggle do background inicializado');
    }

    logElementsStatus() {
        const elements = [
            { name: 'Botão Idiomas Desktop', element: this.buttons.languageDesktop },
            { name: 'Botão Idiomas Mobile', element: this.buttons.languageMobile },
            { name: 'Botão Minha Conta', element: this.buttons.myAccount }
        ];

        console.log('🔍 Status dos elementos:');
        elements.forEach(({ name, element }) => {
            console.log(`   ${element ? '✅' : '❌'} ${name}`);
        });
    }

    attachEventListeners() {
        Object.entries(this.buttons).forEach(([key, button]) => {
            if (button) {
                button.addEventListener('click', (e) => this.toggle(key));
            }
        });
    }

    toggle(buttonName) {
        if (window.innerWidth <= 768) {
            console.log('📱 Mobile detectado - background toggle desativado');
            return;
        }

        console.log(`🖱️ Clique detectado: ${this.formatButtonName(buttonName)}`);

        this.homeSection.style.backgroundPosition = this.isDown
            ? 'center center, center center, center center, center center, center center'
            : 'center calc(center + 200px), center calc(center + 200px), center calc(center + 200px), center calc(center + 200px), center calc(center + 200px)';

        this.isDown = !this.isDown;

        console.log(this.isDown ? '⬇️ Background desceu 200px' : '⬆️ Background voltou ao normal');
    }

    formatButtonName(key) {
        const names = {
            languageDesktop: 'Idiomas (Desktop)',
            languageMobile: 'Idiomas (Mobile)',
            myAccount: 'Minha Conta'
        };
        return names[key] || key;
    }
}

// ============================================================================
// 20. NAVBAR AUMENTA 200PX DE ALTURA - APENAS DESKTOP
// ============================================================================

let navbarExtended = false;

function toggleNavbarHeight() {
    if (window.innerWidth <= 768) {
        console.log('📱 Mobile detectado - navbar toggle desativado');
        return;
    }

    const navbar = document.getElementById('navbar');

    if (!navbar) return;

    if (navbarExtended) {
        navbar.style.height = 'auto';
        navbar.style.paddingBottom = '0';
        navbarExtended = false;
        console.log('✅ Navbar voltou ao normal');
    } else {
        navbar.style.height = 'auto';
        navbar.style.paddingBottom = '170px';
        navbarExtended = true;
        console.log('⬇️ Navbar aumentou 190px');
    }
}

// ============================================================================
// 21. INICIALIZAÇÃO FINAL
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    new AccountDropdown();
    new LanguageSelector(true);
    new LanguageSelector(false);
    new BackgroundToggle();

    setTimeout(() => {
        loadLanguagePreference();
    }, 200);

    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                return;
            }
            e.stopPropagation();
            toggleNavbarHeight();
        });
    }

    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        languageBtn.addEventListener('click', function (e) {
            if (window.innerWidth > 768) {
                e.stopPropagation();
                toggleNavbarHeight();
            }
        });
    }

    const languageBtnMobile = document.getElementById('languageBtnMobile');
    if (languageBtnMobile) {
        languageBtnMobile.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    document.addEventListener('click', function (e) {
        if (window.innerWidth > 768) {
            if (!e.target.closest('.dropdown') && !e.target.closest('.language-selector') && navbarExtended) {
                toggleNavbarHeight();
            }
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, languageData, translatePage };
}

// ============================================================================
// 22. ATIVA MENU HAMBÚRGUER EM TELAS DIVIDIDAS
// ============================================================================

const hamburgerBreakpoint = document.createElement('style');
hamburgerBreakpoint.innerHTML = `
    /* ESCONDE menu desktop e MOSTRA hambúrguer até 1150px */
    @media (max-width: 1150px) {
        
        /* MOSTRA o botão hambúrguer */
        .nav-toggle {
            display: flex !important;
        }
        
        /* ESCONDE o menu desktop completo */
        .nav-menu {
            display: none !important;
        }
        
        /* Quando menu ativo, mostra como mobile */
        .nav-menu.active {
            display: flex !important;
        }
        
        /* ESCONDE seletor de idiomas desktop */
        .language-selector.language-selector-desktop,
        .language-btn:not(.language-btn-mobile) {
            display: none !important;
        }
    }
    
    /* Acima de 1150px = desktop normal */
    @media (min-width: 1151px) {
        
        /* ESCONDE hambúrguer */
        .nav-toggle {
            display: none !important;
        }
        
        /* MOSTRA menu desktop */
        .nav-menu {
            display: flex !important;
        }
        
        /* ESCONDE idiomas mobile */
        .nav-language-mobile {
            display: none !important;
        }
    }
`;

document.head.appendChild(hamburgerBreakpoint);
console.log('✅ Menu hambúrguer ativado para telas até 1150px');


document.addEventListener('DOMContentLoaded', function () {

    const hamburger = document.querySelector('.nav-toggle');

    function verificarTela() {
        const larguraJanela = window.innerWidth;
        const larguraTela = window.screen.width;

        // Se janela não está 100% da tela
        if (larguraJanela < larguraTela && hamburger) {
            hamburger.style.display = 'flex';
            console.log('🍔 Hambúrguer visível (tela dividida)');
        } else if (hamburger) {
            hamburger.style.display = '';
            console.log('🖥️ Modo normal');
        }
    }

    verificarTela();
    window.addEventListener('resize', verificarTela);

    // Quando tela dividida: logo esquerda + hambúrguer direita
    function ajustarLayout() {
        const larguraJanela = window.innerWidth;
        const larguraTela = window.screen.width;
        const container = document.querySelector('.nav-container');

        if (larguraJanela < larguraTela && container) {
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between';
            container.style.alignItems = 'center';
        } else if (container) {
            container.style.display = '';
            container.style.justifyContent = '';
            container.style.alignItems = '';
        }
    }

    ajustarLayout();
    window.addEventListener('resize', ajustarLayout);

});



document.addEventListener('DOMContentLoaded', function () {

    const logo = document.querySelector('.nav-img');
    const hamburger = document.querySelector('.nav-toggle');

    // FORÇA ambos = 50x50px
    if (logo) {
        logo.style.height = '50px';
        logo.style.width = '50px';
        logo.style.minHeight = '50px';
        logo.style.minWidth = '50px';
        logo.style.maxHeight = '50px';
        logo.style.maxWidth = '50px';
    }

    if (hamburger) {
        hamburger.style.height = '50px';
        hamburger.style.width = '50px';
        hamburger.style.minHeight = '50px';
        hamburger.style.minWidth = '50px';
        hamburger.style.maxHeight = '50px';
        hamburger.style.maxWidth = '50px';
    }

});


document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.language-option').forEach(function (option) {
        option.addEventListener('click', function () {
            const lang = this.dataset.lang;
            if (!lang || !translations[lang]) return;

            // Salva o idioma escolhido
            saveLanguagePreference(lang);

            // Recarrega a página — resolve todos os bugs de layout
            window.location.reload();
        });
    });
});



// ============================================================================
// 23. Galeria De Imagens Da Equipe 
// ============================================================================


(function () {
    /* ---- IMAGENS: troque pelos URLs reais do projeto ---- */
    const C3D_IMAGES = [
        './carrocel-1.jpg',
        './carrocel-2.jpg',
        './carrocel-3.jpg',
        './carrocel-9.jpeg',
        './carrocel-6.jpg',
        './carrocel-7.jpg',
        './carrocel-8.jpeg',
        './carrocel-4.jpeg',
        './carrocel-11.jpg',
    ];


    const N = C3D_IMAGES.length;
    const ANGLE = 360 / N;

    const track = document.getElementById('c3dTrack');
    const dotsEl = document.getElementById('c3dDots');
    const curEl = document.getElementById('c3dCur');
    const totEl = document.getElementById('c3dTotal');
    const playEl = document.getElementById('c3dPlay');

    totEl.textContent = String(N).padStart(2, '0');

    let current = 0;
    let autoplay = true;
    let timer;

    /* ---- Calcula tamanho dos slides ---- */
    function getSize() {
        const vw = window.innerWidth;
        const w = Math.min(Math.max(vw * 0.26, 130), 250);
        const h = Math.round(w * (130 / 180));
        const gap = w + 20;
        const tz = Math.round(gap / (2 * Math.tan(Math.PI / N)));
        return { w, h, tz };
    }

    /* ---- Posiciona todos os slides ---- */
    function positionAll() {
        const { w, h, tz } = getSize();
        document.querySelectorAll('.c3d-item').forEach((s, i) => {
            s.style.width = `${w}px`;
            s.style.height = `${h}px`;
            s.style.marginLeft = `-${w / 2}px`;
            s.style.marginTop = `-${h / 2}px`;
            s.style.transform = `rotateY(${i * ANGLE}deg) translateZ(${tz}px)`;
        });
    }

    /* ---- Cria slides e dots ---- */
    C3D_IMAGES.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'c3d-item';
        slide.innerHTML = `
      <img src="${src}" alt="Foto ${i + 1}" loading="lazy">
      <div class="c3d-num">${String(i + 1).padStart(2, '0')}</div>
    `;
        slide.addEventListener('click', () => goTo(i));
        track.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = 'c3d-dot' + (i === 0 ? ' c3d-active' : '');
        dot.addEventListener('click', () => { goTo(i); resetTimer(); });
        dotsEl.appendChild(dot);
    });

    positionAll();

    /* ---- Atualiza visual ---- */
    function update() {
        track.style.transform = `rotateY(${-current * ANGLE}deg)`;

        document.querySelectorAll('.c3d-dot').forEach((d, i) =>
            d.classList.toggle('c3d-active', i === current)
        );

        curEl.textContent = String(current + 1).padStart(2, '0');

        document.querySelectorAll('.c3d-item').forEach((s, i) => {
            const diff = ((i - current) % N + N) % N;
            const closest = Math.min(diff, N - diff);
            s.style.opacity = closest === 0 ? 1 : closest === 1 ? 0.6 : 0.25;

            if (closest === 0) {
                s.classList.remove('c3d-pop');
                void s.offsetWidth;
                s.classList.add('c3d-pop');
            } else {
                s.classList.remove('c3d-pop');
            }
        });
    }

    function goTo(idx) { current = ((idx % N) + N) % N; update(); }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    /* ---- Controles ---- */
    document.getElementById('c3dNext').addEventListener('click', () => { next(); resetTimer(); });
    document.getElementById('c3dPrev').addEventListener('click', () => { prev(); resetTimer(); });

    playEl.addEventListener('click', () => {
        autoplay = !autoplay;
        const t = translations[currentLang] || translations['pt'];
        playEl.innerHTML = autoplay
            ? `⏸ <span class="c3d-lbl">${t.galleryPause}</span>`
            : `▶ <span class="c3d-lbl">${t.galleryPlay}</span>`;
        autoplay ? startTimer() : clearInterval(timer);

        const galleryHeading = document.querySelector('.c3d-heading');
        if (galleryHeading) {
            galleryHeading.innerHTML = `${t.galleryHeading} <span>${t.galleryHeadingSpan}</span>`;
        }
        const gallerySub = document.querySelector('.c3d-sub');
        if (gallerySub) gallerySub.textContent = t.gallerySub;

        const prevBtn = document.getElementById('c3dPrev');
        if (prevBtn) prevBtn.innerHTML = `← <span class="c3d-lbl">${t.previousWorkshop}</span>`;

        const nextBtn = document.getElementById('c3dNext');
        if (nextBtn) nextBtn.innerHTML = `<span class="c3d-lbl">${t.nextWorkshop}</span> →`;

        const playBtnGal = document.getElementById('c3dPlay');
        if (playBtnGal) {
            const isPlaying = playBtnGal.innerHTML.includes('⏸');
            playBtnGal.innerHTML = isPlaying
                ? `⏸ <span class="c3d-lbl">${t.galleryPause}</span>`
                : `▶ <span class="c3d-lbl">${t.galleryPlay}</span>`;
        }
    });

    function startTimer() { clearInterval(timer); timer = setInterval(next, 3000); }
    function resetTimer() { if (autoplay) startTimer(); }

    /* ---- Teclado ---- */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { next(); resetTimer(); }
        if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
    });

    /* ---- Touch / swipe ---- */
    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetTimer(); }
    });

    /* ---- Redimensionamento ---- */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { positionAll(); update(); }, 100);
    });

    /* ---- Inicia ---- */
    update();
    startTimer();
})();



// ============================================================================
// 23. JOGO DOS VOZES/HISTORIA — com suporte a BABY-SAD.mp3
// ============================================================================

(function () {
    'use strict';

    /* ─── Música de fundo (BABY-SAD.mp3) ─── */
    // Coloque o arquivo BABY-SAD.mp3 na mesma pasta deste script
    const bgMusic = new Audio('BABY-SAD.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.55;

    function bgMusicPlay() {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(() => {
            // Navegador bloqueou autoplay — toca no primeiro clique do usuário
            document.addEventListener('click', () => bgMusic.play(), { once: true });
        });
    }
    function bgMusicPause() { bgMusic.pause(); }
    function bgMusicResume() { bgMusic.play().catch(() => {}); }
    function bgMusicStop() { bgMusic.pause(); bgMusic.currentTime = 0; }

    /* ─── Audio (efeitos sonoros originais) ─── */
    let bgCtx = null;
    function bgAC() { if (!bgCtx) bgCtx = new (window.AudioContext || window.webkitAudioContext)(); if (bgCtx.state === 'suspended') bgCtx.resume(); return bgCtx; }
    function bgMG(c, v = 0.7) { const g = c.createGain(); g.gain.value = v; g.connect(c.destination); return g; }
    function bgKick(t) { const c = bgAC(); t = t || c.currentTime; const o = c.createOscillator(), g = c.createGain(), m = bgMG(c, .85); o.connect(g); g.connect(m); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(.01, t + .35); g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); o.start(t); o.stop(t + .41); }
    function bgSnare(t) { const c = bgAC(); t = t || c.currentTime; const buf = c.createBuffer(1, c.sampleRate * .22, c.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, .4); const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), m = bgMG(c, .5); f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5; src.buffer = buf; src.connect(f); f.connect(g); g.connect(m); g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.001, t + .22); src.start(t); src.stop(t + .23); }
    function bgHihat(t) { const c = bgAC(); t = t || c.currentTime; const buf = c.createBuffer(1, c.sampleRate * .06, c.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), m = bgMG(c, .3); f.type = 'highpass'; f.frequency.value = 9000; src.buffer = buf; src.connect(f); f.connect(g); g.connect(m); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .06); src.start(t); src.stop(t + .07); }
    function bgBass(freq, t) { const c = bgAC(); t = t || c.currentTime; const o = c.createOscillator(), g = c.createGain(), m = bgMG(c, .35); o.type = 'sawtooth'; o.frequency.value = freq; o.connect(g); g.connect(m); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.start(t); o.stop(t + .31); }
    function bgHit(lane) { const c = bgAC(), t = c.currentTime; const freqs = [130, 175, 220, 165]; const o = c.createOscillator(), g = c.createGain(), m = bgMG(c, .2); o.type = 'sine'; o.frequency.value = freqs[lane]; o.connect(g); g.connect(m); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .15); o.start(t); o.stop(t + .16); }
    function bgMiss() { const c = bgAC(), t = c.currentTime; const o = c.createOscillator(), g = c.createGain(), m = bgMG(c, .12); o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(60, t + .12); o.connect(g); g.connect(m); g.gain.setValueAtTime(.2, t); g.gain.exponentialRampToValueAtTime(.001, t + .15); o.start(t); o.stop(t + .16); }
    function bgJingle() { const c = bgAC(), t = c.currentTime;[523, 659, 784].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(), m = bgMG(c, .15); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(m); g.gain.setValueAtTime(.2, t + i * .06); g.gain.exponentialRampToValueAtTime(.001, t + i * .06 + .15); o.start(t + i * .06); o.stop(t + i * .06 + .16); }); }

    let bgBeatTimer = null, bgBeatStep = 0, bgBeatBPM = 92;
    const bgPAT = { kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], snr: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hh: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], bass: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] };
    const bgBNOTES = [55, 55, 58, 62, 55, 58, 62, 65];
    function bgStartBeat() { bgStopBeat(); const ms = (60 / bgBeatBPM / 4) * 1000; bgBeatStep = 0; function tick() { const c = bgAC(), t = c.currentTime; if (bgPAT.kick[bgBeatStep]) bgKick(t); if (bgPAT.snr[bgBeatStep]) bgSnare(t); if (bgPAT.hh[bgBeatStep]) bgHihat(t); if (bgPAT.bass[bgBeatStep]) bgBass(bgBNOTES[(bgBeatStep / 2) | 0], t); bgBeatStep = (bgBeatStep + 1) % 16; bgBeatTimer = setTimeout(tick, ms); } tick(); }
    function bgStopBeat() { clearTimeout(bgBeatTimer); bgBeatTimer = null; }

    const bgMSGS = [
        { era: 'NEW YORK · 1973', title: 'O NASCIMENTO DO HIP HOP', quote: '"Eu via a música como uma arma para unir a galera, tirar ela das gangues."', author: '— DJ Kool Herc', fact: 'Em <strong>11 de agosto de 1973</strong>, no Bronx, Nova York, DJ Kool Herc fez uma festa no 1520 Sedgwick Avenue. Ele isolou o "breakbeat" criando o loop que fundaria o hip hop. A data é reconhecida como o <em>aniversário oficial do hip hop</em>.', tags: ['DJ Kool Herc', 'Bronx', '1973', 'Breakbeat', 'Origem'] },
        { era: 'NEW YORK · 1975', title: 'GRANDMASTER FLASH E O SCRATCH', quote: '"O scratch não foi uma invenção planejada. Foi um acidente que virou arte."', author: '— Grandmaster Flash', fact: '<strong>Grandmaster Flash</strong> desenvolveu técnicas de scratching e mixing que transformaram o DJ em músico. Inventou o <em>Quick Mix Theory</em>, base de toda a cultura DJ moderna.', tags: ['Scratch', 'DJing', 'Grandmaster Flash', 'Técnica'] },
        { era: 'NEW YORK · 1979', title: 'O PRIMEIRO RAP NO RÁDIO', quote: '"Hip Hop, hooray! Nós sabíamos que estava mudando tudo."', author: '— Wonder Mike, Sugarhill Gang', fact: '<strong>Rapper\'s Delight</strong> do Sugarhill Gang (1979) foi o primeiro rap a tocar no rádio. Vendeu mais de <em>8 milhões de cópias</em>. O mundo todo ouviu o hip hop pela primeira vez.', tags: ['Sugarhill Gang', 'Primeiro Rap', 'Rádio', '1979'] },
        { era: 'SÃO PAULO · 1988', title: 'RACIONAIS MC\'S: A VOZ DA PERIFERIA', quote: '"Rap é compromisso. Não é brincadeira, não é moda."', author: '— Mano Brown', fact: 'Formados em <strong>São Paulo em 1988</strong>, os Racionais MC\'s revolucionaram o rap brasileiro. <em>Sobrevivendo no Inferno</em> (1997) vendeu mais de 1,5 milhão de cópias sem aparecer na TV.', tags: ['Racionais', 'São Paulo', 'Periferia', 'Mano Brown'] },
        { era: 'NEW YORK · 1982', title: 'O BREAKDANCE CONQUISTA AS RUAS', quote: '"Dançar era uma forma de batalhar sem sangue. As ruas viraram palco."', author: '— Crazy Legs Colón', fact: 'O <strong>breakdance</strong> nasceu no Bronx como substituto às brigas de gangues. As batalhas de b-boys usavam movimentos como o <em>headspin, windmill e freeze</em>.', tags: ['Breaking', 'B-boy', 'Bronx', 'Dança'] },
        { era: 'NEW YORK · 1988', title: 'PUBLIC ENEMY: RAP COM POLÍTICA', quote: '"Fight the power! A música tem que dizer algo ou não diz nada."', author: '— Chuck D, Public Enemy', fact: '<strong>Public Enemy</strong> transformou o rap em manifesto político. Chuck D declarou que o rap era "o CNN dos negros". <em>It Takes a Nation</em> (1988) é um dos maiores discos de todos os tempos.', tags: ['Public Enemy', 'Política', 'Chuck D', '1988'] },
        { era: 'SÃO PAULO · 1993', title: 'A VIRADA DA RÁDIO: HIP HOP FM', quote: '"A Rádio Tribo FM abriu o sinal pro rap e a periferia colou tudo."', author: '— DJ Alpiste', fact: 'A <strong>Rádio Tribo FM</strong> de São Paulo foi pioneira em tocar rap brasileiro. O programa <em>Expresso da Rua</em> conectou jovens da periferia de toda a região metropolitana.', tags: ['Rádio', 'São Paulo', 'Anos 90', 'DJ Alpiste'] },
        { era: 'COMPTON · 1988', title: 'N.W.A E O GANGSTA RAP', quote: '"Straight Outta Compton não foi uma música. Foi um documentário."', author: '— Ice Cube', fact: '<strong>N.W.A</strong> chocou o mundo. O FBI enviou cartas às gravadoras. O disco vendeu 3 milhões de cópias <strong>sem tocar no rádio</strong> — só boca a boca.', tags: ['N.W.A', 'Compton', 'Gangsta Rap', 'FBI'] },
        { era: 'BRASIL · 1995', title: 'OS GÊMEOS E O GRAFITE BRASILEIRO', quote: '"O muro é o museu de quem não tem galeria."', author: '— Os Gêmeos', fact: '<strong>Os Gêmeos</strong>, nascidos em São Paulo, são hoje dois dos artistas de street art mais reconhecidos do mundo. Seus murais estão em Nova York, Londres e Paris.', tags: ['Grafite', 'Os Gêmeos', 'São Paulo', 'Street Art'] },
        { era: 'ATLANTA · 1995', title: 'OUTKAST: O SUL TEM ALGO A DIZER', quote: '"O sul tem algo a dizer." — e o mundo inteiro ouviu.', author: '— André 3000, Outkast no Grammy 1995', fact: 'Quando <strong>OutKast</strong> ganhou o Grammy em 1995, André 3000 afirmou o Sul americano como tão válido quanto NY e LA. Depois lançaram <em>Stankonia</em>, clássico absoluto.', tags: ['OutKast', 'Atlanta', 'André 3000', 'Grammy'] },
        { era: 'BRASIL · 2000', title: 'HIP HOP NA EDUCAÇÃO', quote: '"Hip hop entrou nas escolas antes do governo. A periferia se educou sozinha."', author: '— Emicida', fact: 'O <strong>Movimento Hip Hop Organizado</strong> no Brasil usou o hip hop como ferramenta educacional. Hoje o hip hop é parte do currículo em <em>mais de 200 escolas</em> públicas brasileiras.', tags: ['Educação', 'Brasil', 'Movimento', 'Cidadania'] },
        { era: 'NEW YORK · 1996', title: 'JAY-Z E O EMPREENDEDORISMO', quote: '"Não sou um homem de negócios. Sou um negócio, homem."', author: '— Jay-Z', fact: '<strong>Jay-Z</strong> fundou a Roc-A-Fella Records em 1995 com US$ 1.500 emprestados. Hoje é bilionário. Seu modelo inspirou artistas brasileiros como Emicida e a Laboratório Fantasma.', tags: ['Jay-Z', 'Negócios', 'Empreendedorismo', 'Bilionário'] },
        { era: 'BRASIL · 2010', title: 'EMICIDA: DA FEIRA À VIRADA CULTURAL', quote: '"Quem tem boca vai a Roma, mas quem tem flow vai ao mundo inteiro."', author: '— Emicida', fact: '<strong>Emicida</strong> começou vendendo CDs na Feira da Liberdade em São Paulo. Fundou o Laboratório Fantasma e lançou o documentário <em>AmarElo</em> na Netflix.', tags: ['Emicida', 'São Paulo', 'AmarElo', 'Batalha'] },
        { era: 'MUNDO · 2012', title: 'KENDRICK LAMAR E O RAP COMO LITERATURA', quote: '"Sentei com Deus e conversei sobre a vida. Não foi sobre o dinheiro."', author: '— Kendrick Lamar', fact: '<strong>Kendrick Lamar</strong> se tornou o primeiro rapper a ganhar o <em>Prêmio Pulitzer</em> em 2018. Seus álbuns são estudados em universidades ao redor do mundo.', tags: ['Kendrick Lamar', 'Pulitzer', 'Literatura', 'Compton'] },
        { era: 'BRASIL · 2015', title: 'MC CAROL: FEMINISMO DO ASFALTO', quote: '"Não foi Deus que me fez assim. Foi a vida, foi a rua, foi a resistência."', author: '— MC Carol', fact: '<strong>MC Carol</strong> de Niterói mudou o debate sobre feminismo e funk. <em>Não Foi Sua Culpa</em> (2015) mostrou que o funk pode ser <em>ferramenta de empoderamento</em>.', tags: ['MC Carol', 'Feminismo', 'Funk', 'Niterói'] },
        { era: 'SÃO PAULO · 2018', title: 'RACIONAIS: SOBREVIVENDO 20 ANOS', quote: '"20 anos depois, o álbum ainda é verdade. A periferia ainda sangra."', author: '— Mano Brown', fact: 'Em 2017, <strong>Sobrevivendo no Inferno</strong> foi relançado pela Companhia das Letras chegando ao <em>topo das listas de mais vendidos</em> — rap periférico tratado como obra literária.', tags: ['Racionais', 'Sobrevivendo', 'Literatura', 'Legado'] },
        { era: 'MUNDO · 2017', title: 'HIP HOP: O GÊNERO MAIS OUVIDO', quote: '"O rap não é mais o futuro. É o presente e o passado."', author: '— Drake', fact: 'Em 2017 o <strong>hip hop ultrapassou o rock</strong> como gênero mais consumido nos EUA. No Brasil, trap e funk respondem por <em>mais de 40% dos streams mensais</em>.', tags: ['Streaming', 'Global', 'Drake', '2017'] },
        { era: 'BRASIL · 2020', title: 'BK E O RAP INTROSPECTIVO', quote: '"A dor que a gente sente não some. A gente transforma ela em verso."', author: '— BK (Bramon)', fact: '<strong>BK</strong> representa uma nova geração: mais introspectiva e emocional. Com <em>Filipe Ret, Matuê e Orochi</em>, misturou trap, soul e letras filosóficas.', tags: ['BK', 'Nova Geração', 'Trap', 'Brasil'] },
        { era: 'BRASIL · 2023', title: 'BREAKING NAS OLIMPÍADAS', quote: '"Levar o breaking pras Olimpíadas é levar a periferia pro pódio do mundo."', author: '— B-Boy Neguin', fact: 'O <strong>breaking estreou nas Olimpíadas de Paris 2024</strong>. O que começou nas ruas do Bronx em 1973 chegou ao maior palco esportivo 51 anos depois.', tags: ['Breaking', 'Olimpíadas', 'Paris 2024', 'B-Boy Neguin'] },
        { era: 'FUTURO · 2026', title: 'A CULTURA QUE NÃO PARA', quote: '"O hip hop não é um gênero. É uma língua que a periferia criou para falar com o mundo."', author: '— Vozes da Periferia', fact: 'De 1973 ao presente, <em>mais de 50 anos</em> de história. No Brasil, é a <strong>trilha sonora de 50 milhões de periféricos</strong> que resistem, criam e existem com orgulho.', tags: ['Futuro', '50 Anos', 'Global', 'Periferia'] },
    ];

    function bgGenPattern(round, diff) {
        const notes = []; const total = 56 + round * 3; const base = { easy: .22, normal: .36, hard: .52 }[diff]; const dens = Math.min(base + (round - 1) * .012, .72); const used = new Set();
        for (let s = 0; s < total; s++) { if (Math.random() < dens) { const l = Math.floor(Math.random() * 4); const k = `${s}-${l}`; if (!used.has(k)) { used.add(k); notes.push({ lane: l, beat: s }); } } }
        for (let l = 0; l < 4; l++) { if (!notes.find(n => n.lane === l)) notes.push({ lane: l, beat: l * 4 + 1 }); }
        return notes.sort((a, b) => a.beat - b.beat);
    }

    const BGROUNDS = 20;
    let bgDiff = 'easy', bgRound = 1, bgScore = 0, bgCombo = 0, bgMaxCombo = 0, bgPerfect = 0, bgGood = 0, bgMissC = 0, bgTotalNotes = 0, bgRunning = false, bgBeatMs = 0, bgStartTime = 0, bgPattern = [], bgNextIdx = 0, bgActive = [], bgNoteId = 0;

    const bgStageEl = document.getElementById('bgStage');
    const bgPCv = document.getElementById('bgParticleCanvas');
    const bgPCx = bgPCv.getContext('2d');
    const bgJudgeEl = document.getElementById('bgJudge');
    const bgHScore = document.getElementById('bgHudScore');
    const bgHCombo = document.getElementById('bgHudCombo');
    const bgHRound = document.getElementById('bgHudRound');
    const bgHAcc = document.getElementById('bgHudAcc');
    const bgCFill = document.getElementById('bgComboFill');
    const bgPFill = document.getElementById('bgProgressFill');
    const BGCOLORS = ['#FF7A00', '#00F07A', '#00CFFF', '#FF1F6A'];
    const BGICONS = ['🎨', '🎤', '🧢', '🎧'];

    const bgSH = () => bgStageEl.clientHeight;
    const bgHitY = () => bgSH() - 80;
    const bgSPEED = () => ({ easy: .27, normal: .38, hard: .54 }[bgDiff]);
    const bgTRAVEL = () => bgHitY() / bgSPEED();
    const bgWIN_P = 95, bgWIN_G = 185;

    let bgParts = [];
    function bgResizeCv() { bgPCv.width = bgStageEl.clientWidth; bgPCv.height = bgStageEl.clientHeight; }
    function bgBurst(x, y, col, n = 14) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 5; bgParts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 2 + Math.random() * 5, col, life: 1, dec: .035 + Math.random() * .04 }); } }
    function bgRingBurst(x, y, col) { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; bgParts.push({ x, y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, r: 3, col, life: 1, dec: .06 }); } }
    function bgTickParts() { bgPCx.clearRect(0, 0, bgPCv.width, bgPCv.height); bgParts = bgParts.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += .12; p.life -= p.dec; if (p.life <= 0) return false; bgPCx.save(); bgPCx.globalAlpha = p.life; bgPCx.fillStyle = p.col; bgPCx.shadowColor = p.col; bgPCx.shadowBlur = 10; bgPCx.beginPath(); bgPCx.arc(p.x, p.y, p.r, 0, Math.PI * 2); bgPCx.fill(); bgPCx.restore(); return true; }); }

    function bgScorePop(x, y, text, col) { const el = document.createElement('div'); el.className = 'bg-score-pop'; el.textContent = text; el.style.cssText = `top:${y}px;left:${x}px;color:${col};text-shadow:0 0 20px ${col};`; bgStageEl.appendChild(el); setTimeout(() => el.remove(), 750); }
    function bgHexRgb(h) { return `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`; }
    function bgMkNote(lane, id) { const el = document.createElement('div'); el.className = 'bg-note'; el.id = 'bgn' + id; const lw = bgStageEl.clientWidth / 4; el.style.cssText = `width:${lw - 12}px;height:44px;left:${lane * lw + 6}px;top:-52px;background:rgba(${bgHexRgb(BGCOLORS[lane])},.12);border-color:${BGCOLORS[lane]};box-shadow:0 0 14px ${BGCOLORS[lane]}44;`; el.textContent = BGICONS[lane]; bgStageEl.appendChild(el); return el; }

    let bgJTimer = null;
    function bgShowJudge(type) { const J = { perfect: { t: 'PERFEITO!', c: '#00F07A' }, good: { t: 'BOM!', c: '#00CFFF' }, miss: { t: 'PERDEU', c: '#FF1F6A' } }; const m = J[type] || J.miss; bgJudgeEl.textContent = m.t; bgJudgeEl.style.color = m.c; bgJudgeEl.style.opacity = 1; clearTimeout(bgJTimer); bgJTimer = setTimeout(() => { bgJudgeEl.style.opacity = 0; }, 550); }
    function bgFlashLane(lane) { const seg = document.getElementById('bghz' + lane); if (!seg) return; seg.style.opacity = '1'; setTimeout(() => seg.style.opacity = '0', 100); }
    function bgFlashBtn(lane) { const b = document.querySelector(`.bg-hit-btn[data-bglane="${lane}"]`); if (!b) return; b.classList.add('active'); setTimeout(() => b.classList.remove('active'), 100); }

    function bgAddScore(type, lane, y) { const PTS = { perfect: 300, good: 100, miss: 0 }; const mult = 1 + Math.floor(bgCombo / 10) * .15; const add = Math.floor((PTS[type] || 0) * mult); bgScore += add; if (type === 'miss') { bgCombo = 0; } else { bgCombo++; if (bgCombo > bgMaxCombo) bgMaxCombo = bgCombo; if (bgCombo > 0 && bgCombo % 10 === 0) bgJingle(); const lw = bgStageEl.clientWidth / 4; bgScorePop(lane * lw + lw / 2, y, type === 'perfect' ? `+${add}★` : `+${add}`, type === 'perfect' ? '#00F07A' : '#00CFFF'); } bgUpdateHUD(); }
    function bgUpdateHUD() { bgHScore.textContent = bgScore.toLocaleString('pt-BR'); bgHCombo.textContent = '×' + bgCombo; const tot = bgPerfect + bgGood + bgMissC; bgHAcc.textContent = tot > 0 ? Math.round((bgPerfect + bgGood * .5) / tot * 100) + '%' : '—'; bgHRound.textContent = bgRound + '/' + BGROUNDS; bgCFill.style.width = Math.min(bgCombo, 50) / 50 * 100 + '%'; }

    function bgHitLane(lane) {
        if (!bgRunning) return; bgHit(lane); bgFlashBtn(lane); bgFlashLane(lane); const now = performance.now(); let best = null, bestD = Infinity; for (const n of bgActive) { if (n.lane !== lane || n.judged) continue; const d = Math.abs(now - n.targetTime); if (d < bestD) { bestD = d; best = n; } } if (!best || bestD > bgWIN_G) {
            if (!best) { return; }
            bgShowJudge('miss'); return;
        } best.judged = true; const el = document.getElementById('bgn' + best.id); const lw = bgStageEl.clientWidth / 4; const bx = lane * lw + lw / 2, by = bgHitY(); if (bestD <= bgWIN_P) { bgPerfect++; bgAddScore('perfect', lane, by - 20); bgShowJudge('perfect'); bgBurst(bx, by, BGCOLORS[lane], 16); bgRingBurst(bx, by, BGCOLORS[lane]); } else { bgGood++; bgAddScore('good', lane, by - 20); bgShowJudge('good'); bgBurst(bx, by, BGCOLORS[lane], 8); } if (el) { el.style.opacity = '0'; el.style.transform = 'scale(1.4)'; setTimeout(() => el.remove(), 150); }
    }

    let bgRaf = null;
    function bgGameLoop() {
        if (!bgRunning) { bgTickParts(); return; } const now = performance.now(); const elapsed = now - bgStartTime; const roundDur = bgPattern[bgPattern.length - 1].beat * bgBeatMs + 1200; bgPFill.style.width = Math.min(elapsed / roundDur * 100, 100) + '%'; while (bgNextIdx < bgPattern.length) { const n = bgPattern[bgNextIdx]; const noteTime = n.beat * bgBeatMs; const spawnTime = noteTime - bgTRAVEL(); if (elapsed >= spawnTime) { const id = ++bgNoteId; const el = bgMkNote(n.lane, id); bgActive.push({ id, lane: n.lane, targetTime: bgStartTime + noteTime, el, judged: false }); bgNextIdx++; } else break; } for (const n of bgActive) {
            if (n.judged) continue; const el = document.getElementById('bgn' + n.id); if (!el) continue; const tth = n.targetTime - now; const y = bgHitY() - tth * bgSPEED() - 22;
            el.style.top = y + 'px'; if (now > n.targetTime + bgWIN_G && !n.judged) { n.judged = true; bgMissC++; bgAddScore('miss', n.lane, bgHitY()); bgShowJudge('miss'); bgMiss(); el.style.opacity = '.15'; setTimeout(() => el.remove(), 250); }
        } bgActive = bgActive.filter(n => !n.judged || document.getElementById('bgn' + n.id)); if (elapsed > roundDur && bgNextIdx >= bgPattern.length && !bgActive.filter(n => !n.judged).length) { bgEndRound(); return; } bgTickParts(); bgRaf = requestAnimationFrame(bgGameLoop);
    }

    function bgStartRound() {
        document.querySelectorAll('.bg-note,.bg-score-pop').forEach(e => e.remove());
        bgActive = []; bgParts = []; bgNextIdx = 0; bgPFill.style.width = '0%';
        bgBeatBPM = 86 + bgRound * 2; bgBeatMs = (60 / bgBeatBPM / 4) * 1000;
        bgPattern = bgGenPattern(bgRound, bgDiff); bgTotalNotes += bgPattern.length;
        bgStartTime = performance.now() + 700;
        bgUpdateHUD(); bgResizeCv();
        bgStartBeat();
        bgMusicResume(); // ← retoma a música ao iniciar fase
        bgRunning = true;
        bgRaf = requestAnimationFrame(bgGameLoop);
    }

    function bgEndRound() {
        bgRunning = false;
        bgStopBeat();
        cancelAnimationFrame(bgRaf);
        bgMusicPause(); // ← pausa durante a tela de mensagem entre fases
        if (bgRound < BGROUNDS) { bgShowMessage(); } else { bgShowResult(); }
    }

    function bgShow(id) { ['bgScreenIntro', 'bgScreenGame', 'bgScreenMessage', 'bgScreenResult'].forEach(s => { document.getElementById(s).classList.toggle('off', s !== id); }); }

    function bgStartGame() {
        bgScore = 0; bgCombo = 0; bgMaxCombo = 0; bgPerfect = 0; bgGood = 0; bgMissC = 0; bgTotalNotes = 0; bgRound = 1;
        bgShow('bgScreenGame');
        bgMusicPlay(); // ← inicia a música do zero ao começar o jogo
        bgStartRound();
    }

    function bgShowMessage() { const m = bgMSGS[bgRound - 1] || bgMSGS[0]; document.getElementById('bgMsgBadge').textContent = `FASE ${bgRound} COMPLETA`; document.getElementById('bgMsgProg').textContent = `${bgRound} / ${BGROUNDS}`; document.getElementById('bgMsgIcon').textContent = m.icon; document.getElementById('bgMsgEra').textContent = m.era; document.getElementById('bgMsgTitle').textContent = m.title; document.getElementById('bgMsgQuote').textContent = m.quote; document.getElementById('bgMsgAuthor').textContent = m.author; document.getElementById('bgMsgFact').innerHTML = m.fact; document.getElementById('bgTimelineFill').style.width = (bgRound / BGROUNDS * 100) + '%'; const tagsEl = document.getElementById('bgMsgTags'); tagsEl.innerHTML = ''; (m.tags || []).forEach(t => { const el = document.createElement('span'); el.className = 'bg-tag'; el.textContent = '#' + t; tagsEl.appendChild(el); }); const btn = document.getElementById('bgBtnNext'); if (bgRound >= BGROUNDS) { btn.textContent = 'VER RESULTADO →'; btn.className = 'bg-btn-next bg-btn-finish'; } else { btn.textContent = 'PRÓXIMA FASE →'; btn.className = 'bg-btn-next'; } bgShow('bgScreenMessage'); }

    function bgShowResult() {
        bgMusicStop(); // ← para a música na tela de resultado
        const tot = bgPerfect + bgGood + bgMissC; const acc = tot > 0 ? Math.round((bgPerfect + bgGood * .5) / tot * 100) : 0; const g = acc >= 95 ? 'S' : acc >= 80 ? 'A' : acc >= 65 ? 'B' : acc >= 50 ? 'C' : 'D'; const titles = { S: 'LENDÁRIO!', A: 'INCRÍVEL!', B: 'MUITO BOM!', C: 'TOCA DE NOVO!', D: 'PRATICA!' }; const subs = { S: 'PERFEITO', A: 'EXCEPCIONAL', B: 'SÓLIDO', C: 'CONTINUE', D: 'TREINO' }; const cols = { S: '#00F07A', A: '#FF7A00', B: '#00CFFF', C: '#FFD200', D: '#FF1F6A' }; const diffs = { easy: 'FÁCIL', normal: 'NORMAL', hard: 'DIFÍCIL' }; document.getElementById('bgResultBanner').textContent = titles[g]; document.getElementById('bgResultBanner').style.color = cols[g]; document.getElementById('bgResultGrade').textContent = g; document.getElementById('bgResultGrade').style.borderColor = cols[g]; document.getElementById('bgResultGrade').style.color = cols[g]; document.getElementById('bgResultSub').textContent = subs[g]; document.getElementById('bgResultDiff').textContent = `${diffs[bgDiff]} · 20 FASES`; document.getElementById('bgResScore').textContent = bgScore.toLocaleString('pt-BR'); document.getElementById('bgResPerfect').textContent = bgPerfect; document.getElementById('bgResGood').textContent = bgGood; document.getElementById('bgResMiss').textContent = bgMissC; document.getElementById('bgResCombo').textContent = bgMaxCombo; document.getElementById('bgResAcc').textContent = acc + '%'; bgShow('bgScreenResult');
    }

    /* ─── Eventos ─── */
    document.querySelectorAll('[data-bgdiff]').forEach(b => { b.addEventListener('click', () => { document.querySelectorAll('[data-bgdiff]').forEach(x => x.classList.remove('active')); b.classList.add('active'); bgDiff = b.dataset.bgdiff; }); });
    document.getElementById('bgBtnStart').addEventListener('click', () => { bgAC(); bgStartGame(); });
    document.getElementById('bgBtnNext').addEventListener('click', () => { if (bgRound >= BGROUNDS) { bgShowResult(); } else { bgRound++; bgShow('bgScreenGame'); bgStartRound(); } });
    document.getElementById('bgBtnReplay').addEventListener('click', () => { bgAC(); bgStartGame(); });
    document.getElementById('bgBtnHome').addEventListener('click', () => { bgStopBeat(); bgMusicStop(); bgShow('bgScreenIntro'); }); // ← para música ao voltar pra home

    const bgKEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
    document.addEventListener('keydown', e => {
        const l = bgKEYS[e.key];
        if (l === undefined) return;
        if (!bgRunning) return;
        const section = document.getElementById('batida-livre');
        const rect = section ? section.getBoundingClientRect() : null;
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
        e.preventDefault();
        bgHitLane(l);
    });
    document.querySelectorAll('.bg-hit-btn').forEach(b => {
        const l = parseInt(b.dataset.bglane);
        b.addEventListener('mousedown', e => { e.preventDefault(); bgHitLane(l); });
        b.addEventListener('touchstart', e => { bgHitLane(l); }, { passive: true });
    });
    window.addEventListener('resize', bgResizeCv);

    bgResizeCv(); bgUpdateHUD();
})();

// ============================================================================
// 24. MUSICA
// ============================================================================

(function () {
    const btn = document.getElementById('mplayerBtn');
    const panel = document.getElementById('mplayerPanel');
    const closeBtn = document.getElementById('mplayerClose');
    const playBtn = document.getElementById('mplayerPlayBtn');
    const iconPlay = document.getElementById('iconPlay');
    const iconPause = document.getElementById('iconPause');
    const dot = document.getElementById('mplayerDot');
    const status = document.getElementById('mplayerStatus');
    const bpmVal = document.getElementById('bpmVal');
    const bpmSlow = document.getElementById('bpmSlow');
    const bpmNormal = document.getElementById('bpmNormal');
    const bpmFast = document.getElementById('bpmFast');
    const mplayer = document.getElementById('mplayer');

    // SEEK (substituiu o volume)
    const seek = document.getElementById('mplayerSeek');
    const currentTimeEl = document.getElementById('mplayerCurrentTime');
    const durationEl = document.getElementById('mplayerDuration');

    let panelAberto = false;
    let tocando = false;

    const audio = new Audio('faygo.mp3');
    audio.loop = true;

    // FORMATO DE TEMPO
    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    }

    // SEEK - atualiza enquanto toca
    audio.addEventListener('timeupdate', () => {
        if (!seek.dragging) {
            seek.value = (audio.currentTime / audio.duration) * 100 || 0;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    // SEEK - mostra duração total
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    // SEEK - ao arrastar
    seek.addEventListener('input', () => {
        seek.dragging = true;
        const t = (seek.value / 100) * audio.duration;
        currentTimeEl.textContent = formatTime(t);
    });

    // SEEK - ao soltar, pula para o ponto
    seek.addEventListener('change', () => {
        audio.currentTime = (seek.value / 100) * audio.duration;
        seek.dragging = false;
    });

    // Velocidade
    function setVelocidade(rate, label, btnEl) {
        audio.playbackRate = rate;
        bpmVal.textContent = label;
        [bpmSlow, bpmNormal, bpmFast].forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
        document.documentElement.style.setProperty('--vinyl-speed', (1 / rate * 2.5).toFixed(2) + 's');
    }

    bpmSlow.addEventListener('click', () => setVelocidade(0.75, ' Lento', bpmSlow));
    bpmNormal.addEventListener('click', () => setVelocidade(1.0, ' Normal', bpmNormal));
    bpmFast.addEventListener('click', () => setVelocidade(1.3, ' Rápido', bpmFast));

    function atualizarUI() {
        if (tocando) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            dot.classList.add('tocando');
            btn.classList.add('ativo');
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            dot.classList.remove('tocando');
            btn.classList.remove('ativo');
        }
    }

    function tocar() {
        audio.play();
        tocando = true;
        atualizarUI();
        status.textContent = '▶ Baby - Faygo';
    }

    function pausar() {
        audio.pause();
        tocando = false;
        atualizarUI();
        status.textContent = 'Pausado';
    }

    audio.addEventListener('ended', () => {
        tocando = false;
        atualizarUI();
        status.textContent = '✅ Fim da música';
    });

    function togglePlay() { tocando ? pausar() : tocar(); }
    function abrirPanel() { panelAberto = true; panel.classList.add('aberto'); }
    function fecharPanel() { panelAberto = false; panel.classList.remove('aberto'); }

    playBtn.addEventListener('click', togglePlay);

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panelAberto ? fecharPanel() : abrirPanel();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fecharPanel();
    });

    document.addEventListener('click', (e) => {
        if (panelAberto && !mplayer.contains(e.target)) fecharPanel();
    });

    mplayer.style.transition = 'opacity .3s, transform .3s';
    mplayer.style.opacity = '1';
    mplayer.style.pointerEvents = 'auto';
    mplayer.style.transform = 'translateY(0)';

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (current > lastScroll && current > 80) {
            mplayer.style.opacity = '0';
            mplayer.style.pointerEvents = 'none';
            mplayer.style.transform = 'translateY(-12px)';
            if (panelAberto) fecharPanel();
        } else {
            mplayer.style.opacity = '1';
            mplayer.style.pointerEvents = 'auto';
            mplayer.style.transform = 'translateY(0)';
        }
        lastScroll = current;
    }, { passive: true });

    const _orig = window.onLoadingComplete;
    window.onLoadingComplete = function () {
        if (typeof _orig === 'function') _orig();
        setTimeout(() => {
            mplayer.style.opacity = '1';
            mplayer.style.pointerEvents = 'auto';
        }, 1300);
    };

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') fecharPanel();
        if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay(); }
    });
})();