// topbar-sl.js - Topbar component functionality
export class TopbarSL {
  constructor() {
    this.topbarContainer = null;
    this.pageTitle = null;
    this.userDropdown = null;
    this.notificationsBtn = null;
  }

  async init() {
    await this.loadTopbar();
    this.setupEventHandlers();
    this.updatePageTitle();
  }

  async loadTopbar() {
    try {
      const response = await fetch('topbar-sl.html');
      const html = await response.text();
      
      // Find or create topbar container
      this.topbarContainer = document.getElementById('topbar-container');
      if (!this.topbarContainer) {
        this.topbarContainer = document.createElement('div');
        this.topbarContainer.id = 'topbar-container';
        document.body.insertBefore(this.topbarContainer, document.body.firstChild);
      }
      
      this.topbarContainer.innerHTML = html;
      
      // Cache references
      this.pageTitle = document.getElementById('page-title');
      this.userDropdown = document.getElementById('user-dropdown');
      this.notificationsBtn = document.getElementById('notifications-btn');
      this.mobileMenuBtn = document.getElementById('topbar-mobile-menu');
      
    } catch (error) {
      console.warn('Could not load topbar:', error);
    }
  }

  setupEventHandlers() {
    // User dropdown menu actions
    if (this.userDropdown) {
      this.userDropdown.addEventListener('sl-select', (event) => {
        const menuItem = event.detail.item;
        const text = menuItem.textContent.trim();
        
        switch (text) {
          case 'Profile':
            this.handleProfileClick();
            break;
          case 'Settings':
            this.handleSettingsClick();
            break;
          case 'Sign Out':
            this.handleSignOutClick();
            break;
        }
      });

      // Handle dropdown open/close for aria-expanded
      this.userDropdown.addEventListener('sl-show', () => {
        const button = this.userDropdown.querySelector('[role="button"]');
        if (button) button.setAttribute('aria-expanded', 'true');
      });

      this.userDropdown.addEventListener('sl-hide', () => {
        const button = this.userDropdown.querySelector('[role="button"]');
        if (button) button.setAttribute('aria-expanded', 'false');
      });

      // Handle keyboard events on the button wrapper
      const avatarButton = this.userDropdown.querySelector('[role="button"]');
      if (avatarButton) {
        // Use both keydown and keyup to ensure NVDA compatibility
        avatarButton.addEventListener('keyup', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.toggleDropdown();
          }
        });

        avatarButton.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
          // Handle Escape to close
          else if (event.key === 'Escape' && this.userDropdown.open) {
            event.preventDefault();
            this.userDropdown.hide();
            avatarButton.focus();
          }
        });

        // Also handle click events to ensure consistency
        avatarButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.toggleDropdown();
        });
      }

      // Handle keyboard navigation within the menu
      this.userDropdown.addEventListener('keydown', (event) => {
        if (!this.userDropdown.open) return;

        const menuItems = Array.from(this.userDropdown.querySelectorAll('sl-menu-item'));
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        const avatarButton = this.userDropdown.querySelector('[role="button"]');

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            event.stopPropagation();
            const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
            menuItems[nextIndex]?.focus();
            break;
            
          case 'ArrowUp':
            event.preventDefault();
            event.stopPropagation();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
            menuItems[prevIndex]?.focus();
            break;
            
          case 'Escape':
            event.preventDefault();
            event.stopPropagation();
            this.userDropdown.hide();
            avatarButton?.focus();
            break;
            
          case 'Enter':
          case ' ':
            if (document.activeElement && document.activeElement.tagName === 'SL-MENU-ITEM') {
              event.preventDefault();
              event.stopPropagation();
              document.activeElement.click();
            }
            break;
        }
      });
    }

    // Notifications button
    if (this.notificationsBtn) {
      this.notificationsBtn.addEventListener('click', () => {
        this.handleNotificationsClick();
      });
    }

    // Mobile menu button
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.addEventListener('click', () => {
        this.handleMobileMenuClick();
      });
    }
  }

  updatePageTitle(title = null) {
    if (!this.pageTitle) return;
    
    if (title) {
      this.pageTitle.textContent = title;
    } else {
      // Auto-detect from document title or h1
      const docTitle = document.title.split('–')[1]?.trim() || 'Dashboard';
      this.pageTitle.textContent = docTitle;
    }
  }

  handleProfileClick() {
    // Navigate to profile or show profile dialog
    console.log('Profile clicked');
    // Example: window.location.href = 'profile.html';
  }

  handleSettingsClick() {
    // Navigate to settings
    console.log('Settings clicked');
    window.location.href = 'settings.html';
  }

  handleSignOutClick() {
    // Handle sign out
    console.log('Sign out clicked');
    if (confirm('Are you sure you want to sign out?')) {
      window.location.href = 'login.html';
    }
  }

  handleNotificationsClick() {
    // Show notifications panel or navigate to notifications
    console.log('Notifications clicked');
    // Example: show a notifications dropdown or navigate to notifications page
  }

  handleMobileMenuClick() {
    // Toggle the mobile sidebar open/closed
    const mobileSidebar = document.querySelector('inc-sidebar.sidebar-mobile');
    if (mobileSidebar) {
      if (mobileSidebar.hasAttribute('open')) {
        mobileSidebar.removeAttribute('open');
      } else {
        mobileSidebar.setAttribute('open', '');
      }
    }
  }

  toggleDropdown() {
    if (!this.userDropdown) return;

    if (this.userDropdown.open) {
      this.userDropdown.hide();
    } else {
      this.userDropdown.show();
      // Focus the first menu item after opening - use longer timeout for screen readers
      setTimeout(() => {
        const firstMenuItem = this.userDropdown.querySelector('sl-menu-item');
        if (firstMenuItem) {
          firstMenuItem.focus();
        }
      }, 200); // Increased timeout for screen reader compatibility
    }
  }

  // Method to update page title from other pages
  setPageTitle(title) {
    this.updatePageTitle(title);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  window.topbar = new TopbarSL();
  await window.topbar.init();
});
