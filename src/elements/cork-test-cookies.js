import { LitElement } from 'lit';
import {render, styles} from './cork-test-cookies.tpl.js';

/**
 * @description A development-only element that creates test cookies for demonstration purposes. 
 * It includes both host-only cookies and parent-domain cookies to allow testing of cookie deletion across different scopes.
 * This element should only be used in development environments and should not be included in production builds.
 */
export default class CorkTestCookies extends LitElement {

  static get properties() {
    return {
        parentDomain: {type: String, attribute: 'parent-domain'},
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

    connectedCallback() {
        super.connectedCallback();
    }

   /**
    * @description Creates test cookies for demonstration purposes. Only in dev environments.
    * @returns {void}
   */
    createTestCookies() {
        const parentDomain = this.parentDomain;
        console.log('Creating test cookies with parent domain:', parentDomain || this.getParentDomain());

        // --- Host-only cookies (no domain) ---
        document.cookie = "test_host_1=abc; path=/";
        document.cookie = "test_host_2=123; path=/";

        // --- Parent-domain cookies ---
        if (parentDomain) {
            console.log('Creating parent-domain cookies with domain:', parentDomain);
            document.cookie = `test_parent_1=abc; path=/; domain=${parentDomain};`;
            document.cookie = `test_parent_2=123; path=/; domain=${parentDomain};`;
            document.cookie = `test_hard_cookie=abc; path=/; domain=${parentDomain};`;
        }

        // --- Mixed / realistic cookies ---
        document.cookie = "session_test_cookie=xyz; path=/";
        document.cookie = "analytics_test_cookie=456; path=/";        

        console.log("Test cookies created");
        location.reload()
    }

    /**
     * @description Retrieves the parent domain of the current page by extracting the last two segments of the hostname.
     * @returns {string} The parent domain of the current page and deleted across sub domains
     */
    getParentDomain() {
        const host = window.location.hostname;

        // Skip localhost
        if (host === 'localhost') {
            return '';
        }

        // Skip IPv4 addresses
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
            return '';
        }

        const parts = host.split('.');

        // Less than 2 parts mean no parent domain to return
        if (parts.length < 2) {
            return '';
        }

        // Return two parts from parent domain
        return `.${parts.slice(-2).join('.')}`;

    }   

}
