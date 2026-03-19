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
    let allCookies = document.cookie;
    const ca = allCookies.split(';');
    const cookies = ca.map(cookie => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        return { name:name, value:value, valueLength: value.length };
    });
    this.cookies = cookies;
 }

  /**
   * @param {string} cookieName - The name of the cookie to delete
   * @returns {void}
   * Deletes a cookie by setting its expiration date to a past date. 
   * To delete an HttpOnly cookie, you would need to do so from the server side by sending a Set-Cookie header with an expired date.
   */
 deleteCookie(cookie) {
    console.log(`Deleting cookie: ${cookie.name}`);
 }
  connectedCallback() {
    this.getCookies();
    super.connectedCallback();
  }

}

customElements.define('cork-cookie-manager', CorkCookieManager);