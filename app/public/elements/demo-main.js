import { LitElement } from 'lit';
import {render, styles} from './demo-main.tpl.js';

import { Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';
import { LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class DemoMain extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.isDev = window.location.hostname === 'localhost';
    this.groupRules = [
        {
          "name": "testGroup",
          "label": "Test Group",
          "patterns": [".*test.*"]
        },
        {
          "name": "googleAnalytics",
          "label": "Google Analytics",
          "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
        },
        {
          "name": "attributeOther",
          "label": "Other",
          "patterns": [".*"]
        }
      ];
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * @description Creates a set of test cookies for development/demo purposes.
   * After creation, triggers a refresh of the cookie manager to reflect the new cookies.
   * @returns {void}
   */
  createTestCookies() {
    const host = window.location.hostname;
    let parentDomain = '';
    if (host !== 'localhost' && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      const parts = host.split('.');
      if (parts.length >= 2) {
        parentDomain = `.${parts.slice(-2).join('.')}`;
      }
    }

    document.cookie = "test_host_1=abc; path=/";
    document.cookie = "test_host_2=123; path=/";

    if (parentDomain) {
      document.cookie = `test_parent_1=abc; path=/; domain=${parentDomain};`;
      document.cookie = `test_parent_2=123; path=/; domain=${parentDomain};`;
      document.cookie = `test_hard_cookie=abc; path=/; domain=${parentDomain};`;
    }

    document.cookie = "session_test_cookie=xyz; path=/";
    document.cookie = "analytics_test_cookie=456; path=/";

    const cookieManager = this.shadowRoot?.querySelector('cork-cookie-manager');
    if (cookieManager) {
      cookieManager.getCookies();
    }
  }

}

customElements.define('demo-main', DemoMain);