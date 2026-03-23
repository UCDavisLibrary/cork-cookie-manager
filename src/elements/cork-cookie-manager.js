import { LitElement } from 'lit';
import {render, styles} from './cork-cookie-manager.tpl.js';

import { Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';
import { LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class CorkCookieManager extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
        groupRules: {type: Array, attribute: 'group-rules'},
        parentDomain: {type: String, attribute: 'parent-domain'},
        config: {type: Object},
        cookies: {type: Array},
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.cookies = [];
    this.config = {
        name: "all",
        label: "All non-HttpOnly cookies",
        patterns: [".*"]
    };
  }

  /**
   * @description Retrieves all cookies accessible via JavaScript (i.e., non-HttpOnly cookies) and stores them in the `cookies` property. 
   * To manage HttpOnly cookies, you would need to do so from the server side by sending appropriate Set-Cookie headers.
   */
  getCookies() {
    const allCookies = document.cookie || '';

    // no cookies, return empty array
    if (!allCookies) {
        this.cookies = [];
        return;
    }
    const parsedCookies = allCookies.split(';')
        .map(cookie => cookie.trim())
        .filter(cookie => cookie.length > 0)
        .map(cookie => {
            const separatorIndex = cookie.indexOf('=');
            let name, value;
            if (separatorIndex === -1) {
                // Handle case where cookie string does not contain '=' character
                name = cookie.trim();
                value = '';
            } else {
                // Split on the first '=' character to allow for '=' in the cookie value
                name = cookie.slice(0,separatorIndex).trim();
                value = cookie.slice(separatorIndex + 1).trim();
                }

            const safeValue = value != null ? value : '';
            return { name, value: safeValue, valueLength: safeValue.length };
        });
    this.cookies = parsedCookies;
 }

  /**
   * @param {{name: string}} cookie - Cookie object to act on. Currently only the `name` property is used.
   * This function is triggered when the delete button for a cookie is clicked. 
   * It retrieves the cookie name from the event's dataset and calls the `performDelete` method 
   */
    deleteCookie(e) {
        const cookieName = e.target.dataset.cookieName;
        this.performDelete(cookieName);
    }

    /**
     * @param {string} cookieName - The name of the cookie to delete.
     * This is a placeholder function that simulates the deletion of a cookie by logging its name.
     * In a real implementation, you would need to delete the cookie by setting its expiration date to a past date
     * via `document.cookie`, and specify the cookie's path and domain to ensure it is deleted correctly.
     */
    performDelete(cookieName) {
        console.log(`Deleting cookie: ${cookieName}`);
    }



 
 connectedCallback() {
    super.connectedCallback();
    this.getCookies();
  }

}

customElements.define('cork-cookie-manager', CorkCookieManager);