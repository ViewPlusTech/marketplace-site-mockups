// inc-sidebar.js (ES module)
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/components/drawer/drawer.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display:block; }
    aside.sidebar {
      height: 100%;
      display: flex; flex-direction: column; box-sizing: border-box;
      background: #004b8d; color: #fff; padding: 1.25rem;
    }

    .brand { margin-bottom: 1rem; text-align: center; }
    .logo { max-width: 140px; height: auto; display: inline-block; }

    nav.nav { display: flex; flex-direction: column; gap: .25rem; }
    nav.nav a {
      display: block;
      color: #fff;
      text-decoration: none;
      padding: .625rem .75rem;
      border-radius: .5rem;
      outline: none;
    }

    nav.nav a:hover, nav.nav a:focus { background: rgba(255,255,255,.12); }
    nav.nav a[aria-current="page"] { background: rgba(255,255,255,.22); font-weight:600; }
    a.user-info { 
    margin-top: 1.5rem; 
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.2);
    display:block; 
    color:#fff; 
    text-decoration:none;
    padding:.625rem .75rem; 
    border-radius:.5rem; 
  }  
    a.user-info:hover, a.user-info:focus { background: rgba(255,255,255,.12); }
    :host([mobile]) aside.sidebar { padding: 1rem; }
  </style>

  <aside class="sidebar">
    <div class="brand"><img src="Inclusio font white.png" alt="Inclusio Logo" class="logo" /></div>
    <nav class="nav" aria-label="Main navigation" id="sidebar-nav">
      <a href="dashboard.html"        title="Go to the home dashboard">Home</a>
      <a href="uploaded-files.html"   title="View and manage your content">My Content</a>
      <a href="generators.html"       title="Access content generators">Generators</a>
      <a href="help.html"             title="Get help and support">Help</a>
      <a href="settings.html"         title="Change your settings">Settings</a>
      <a href="pricing.html"          title="Upgrade your account">Upgrade</a>
    </nav>
    <a href="login.html" class="user-info" tabindex="0" title="View your profile and account options">Hari</a>
  </aside>
`;

class IncSidebar extends HTMLElement {
  static get observedAttributes() { return ['mobile', 'open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // Mark current page as active
    const nav = this.shadowRoot.getElementById('sidebar-nav');
    const here = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    [...nav.querySelectorAll('a')].forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (href === here) a.setAttribute('aria-current', 'page');
    });

    // If mobile, wrap in a Shoelace drawer
    if (this.hasAttribute('mobile')) this.#wrapInDrawer();
  }

  attributeChangedCallback(name) {
    if (name === 'open' && this.hasAttribute('mobile') && this.drawer) {
      this.hasAttribute('open') ? this.drawer.show() : this.drawer.hide();
    }
  }

  focusFirstLink() {
    const first = this.shadowRoot.querySelector('#sidebar-nav a');
    first?.focus();
  }

  #wrapInDrawer() {
    if (this.drawer) return;

    // 1) Create the drawer
    const drawer = document.createElement('sl-drawer');
    drawer.label = 'Menu';
    drawer.placement = 'start'; // left

    // 2) Grab the existing <aside> (already styled by the <style> in this shadow root)
    const aside = this.shadowRoot.querySelector('aside.sidebar');
    if (!aside) return;

    // 3) Insert the drawer *after* the <style> and move <aside> into it
    //    IMPORTANT: do NOT clear shadowRoot; we want to keep the <style> node!
    const styleEl = this.shadowRoot.querySelector('style');
    if (styleEl && styleEl.nextSibling) {
      this.shadowRoot.insertBefore(drawer, styleEl.nextSibling);
    } else {
      this.shadowRoot.append(drawer);
    }
    drawer.append(aside); // move aside inside the drawer

    // 4) Keep a reference and wire open/close sync with the 'open' attribute
    this.drawer = drawer;
    drawer.addEventListener('sl-after-hide', () => this.removeAttribute('open'));
    drawer.addEventListener('sl-after-show', () => this.setAttribute('open', ''));
  }

}

customElements.define('inc-sidebar', IncSidebar);
