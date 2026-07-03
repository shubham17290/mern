// Theme Switcher Functionality
// Handles theme switching with localStorage persistence

(function() {
    'use strict';

    // Theme configuration
    const themes = ['light', 'dark', 'cyberpunk', 'sepia'];
    const defaultTheme = 'light';
    
    // DOM elements
    const themeSelect = document.getElementById('theme-select');
    const body = document.body;
    
    // Storage key for localStorage
    const STORAGE_KEY = 'selected-theme';

    /**
     * Apply theme to the document
     * @param {string} theme - The theme to apply
     */
    function applyTheme(theme) {
        // Remove existing theme attribute
        body.removeAttribute('data-theme');
        
        // Set the selected theme
        if (theme && theme !== defaultTheme) {
            body.setAttribute('data-theme', theme);
        }
        
        // Update select dropdown if it exists
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    /**
     * Save theme to localStorage
     * @param {string} theme - The theme to save
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Unable to save theme to localStorage:', e);
        }
    }

    /**
     * Load theme from localStorage
     * @returns {string} The saved theme or default theme
     */
    function loadTheme() {
        try {
            const savedTheme = localStorage.getItem(STORAGE_KEY);
            // Validate that the saved theme is one of our supported themes
            if (savedTheme && themes.includes(savedTheme)) {
                return savedTheme;
            }
        } catch (e) {
            console.warn('Unable to load theme from localStorage:', e);
        }
        return defaultTheme;
    }

    /**
     * Handle theme change event
     * @param {Event} event - The change event
     */
    function handleThemeChange(event) {
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
        saveTheme(selectedTheme);
        
        // Add a subtle animation class for visual feedback
        body.style.opacity = '0.8';
        setTimeout(() => {
            body.style.opacity = '1';
        }, 150);
    }

    /**
     * Initialize theme switcher
     */
    function init() {
        // Load saved theme or use default
        const savedTheme = loadTheme();
        
        // Apply the theme
        applyTheme(savedTheme);
        
        // Add event listener to theme select
        if (themeSelect) {
            themeSelect.addEventListener('change', handleThemeChange);
            
            // Set initial value
            themeSelect.value = savedTheme;
        } else {
            console.warn('Theme select element not found');
        }

        // Listen for system theme changes (optional enhancement)
        if (window.matchMedia) {
            const systemThemeDark = window.matchMedia('(prefers-color-scheme: dark)');
            
            // If no saved theme, use system preference
            const hasStoredTheme = localStorage.getItem(STORAGE_KEY);
            if (!hasStoredTheme) {
                const systemTheme = systemThemeDark.matches ? 'dark' : 'light';
                applyTheme(systemTheme);
                saveTheme(systemTheme);
                if (themeSelect) {
                    themeSelect.value = systemTheme;
                }
            }

            // Optional: Listen for system theme changes
            systemThemeDark.addEventListener('change', (e) => {
                const hasStoredTheme = localStorage.getItem(STORAGE_KEY);
                if (!hasStoredTheme) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    applyTheme(systemTheme);
                    saveTheme(systemTheme);
                    if (themeSelect) {
                        themeSelect.value = systemTheme;
                    }
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already loaded
        init();
    }

    // Expose API for external use if needed
    window.ThemeSwitcher = {
        getCurrentTheme: loadTheme,
        setTheme: (theme) => {
            if (themes.includes(theme)) {
                applyTheme(theme);
                saveTheme(theme);
                if (themeSelect) {
                    themeSelect.value = theme;
                }
            }
        },
        getAvailableThemes: () => [...themes]
    };

})();