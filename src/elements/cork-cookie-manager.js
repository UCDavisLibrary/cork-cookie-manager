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
    this.defaultGroupRules = [{
        name: "all",
        label: "All non-HttpOnly cookies",
        patterns: [".*"]
    }];
    this.groupRules = null;
    this._cookieManagerObserver = null;
    this.parentDomain = "";
  }


  /*
    * Lifecycle method called after the component's DOM has been updated for the first time.
  */
  firstUpdated() {
        this.runCookieManager();
  }

  /**
   * @description Sets up a MutationObserver to watch for changes to the cookie manager's content
   * @returns {void}
  */
  _setupGroupRulesObserver() {  
    const cookieManager = this;

    this._cookieManagerObserver = new MutationObserver((mutations) => {
        let shouldSync = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                shouldSync = true;
                break;
            }

            if (mutation.type === 'attributes' &&
                mutation.attributeName === 'group-rules') {
                shouldSync = true;
                break;
            }

            if (mutation.type === 'characterData') {
                shouldSync = true;
                break;
            }
        }

        if(shouldSync) {
            this._syncGroupRules();
        }
    });

    this._cookieManagerObserver.observe(cookieManager, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['group-rules']
    });

  }


  updated(changedProperties) {
    super.updated(changedProperties);

    // If groupRules property has changed, sync it with the cookie manager content
    if (changedProperties.has('groupRules')) {
        this._syncGroupRules();
    }
  }

  /**
   * @description Initializes the cookie manager by setting up the MutationObserver to watch for changes in the cookie manager's content 
   * and performs sync 
   * @returns {void}
   */
  runCookieManager() {
    
    if (!this._cookieManagerObserver) {
        // Start observing for config changes after the component has been rendered for the first time
        this._setupGroupRulesObserver();

        // Initial sync of group rules from cookie manager content
        this._syncGroupRules();  

        // Initial retrieval of cookies after the component has been rendered
        this.getCookies();  
    }
  }

  /**
   * @description Synchronizes the `groupRules` property with the current content of the cookie manager. 
   * It retrieves the group rules from either a JSON script tag or an attribute, validates them, and updates the `groupRules` property if they have changed.
   * @returns {void}
  */
  _syncGroupRules() {
    const cookieManager = this;

    const resolvedRules = this._getGroupRulesFromCookieManager(cookieManager);

    if (!this._groupRulesEqual(this.groupRules, resolvedRules)) {
        this.groupRules = structuredClone(resolvedRules);
    }
  }

 /**
   * @description Retrieves group rules from the cookie manager's content.
   * @param {HTMLElement} cookieManager - The cookie manager element to retrieve group rules from.
   * @returns {Array} An array of group rule objects.
  */
  _getGroupRulesFromCookieManager(cookieManager) {
    // Get group rules from Json inside script tag
    const scriptTag = cookieManager.querySelector('script[type="application/json"]');
    if (scriptTag?.textContent?.trim()) {
        try {
            const parsedScript = JSON.parse(scriptTag.textContent.trim());
            const scriptRules = parsedScript?.groupRules;

            const validationResult = this.validateGroupRules(scriptRules);
            if (validationResult.valid) {
                return validationResult.value;
            }

            console.warn(`Invalid group rules in script JSON: ${validationResult.error}`);

        } catch (e) {
            console.warn('Failed to parse group rules from cookie manager:', e);
        }
    }

    // Fallback to group rules from attribute
    const groupRulesAttr = cookieManager.getAttribute('group-rules');
    if (groupRulesAttr) {
        try {
            const parsedAttr = JSON.parse(groupRulesAttr);

            const validationResult = this.validateGroupRules(parsedAttr);
            if (validationResult.valid) {
                return validationResult.value;
            }

            console.warn(`Invalid group rules in attribute: ${validationResult.error}`);

        } catch (e) {
            console.warn('Failed to parse group rules from attribute:', e);
        }
    }

    // If group rules are already set on the component, validate and use them
    if (this.groupRules != null) {
        const propertyValidation = this.validateGroupRules(this.groupRules);
        if (propertyValidation.valid) {
            return propertyValidation.value;
        }

        console.warn(`Invalid group rules in property: ${propertyValidation.error}`);
    }


    // Return default group rules if no valid rules found
    return structuredClone(this.defaultGroupRules);
  }

  /**
   * @description Checks if two arrays of group rules are equal.
   * @param {Array} a - The first array of group rules.
   * @param {Array} b - The second array of group rules.
   * @returns {boolean} True if the arrays are equal, false otherwise.
   */
  _groupRulesEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
   }

  /**
   * @description Retrieves all cookies accessible via JavaScript (i.e., non-HttpOnly cookies) and stores them in the `cookies` property. 
   * To manage HttpOnly cookies, you would need to do so from the server side by sending appropriate Set-Cookie headers.
   * @returns {void}
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

    /**
     * @description Validates the structure and content of group rules. 
     * @param {*} groupRules 
     * @returns 
     */
    validateGroupRules(groupRules) {
        let error = null;

        if (!Array.isArray(groupRules)) {
            return { valid: false, error: 'groupRules must be an array' };
        }

        groupRules.forEach((rule, index) => {
            // Skip further validation if an error has already been found
            if (error) return; 

            // Validate that each rule is an object
            if (!rule || typeof rule !== 'object') {
                error = `groupRules[${index}] is not a valid object`;
                return;
            }

            // Validate that name is a non-empty string
            if (typeof rule.name !== 'string' || !rule.name.trim()) {
                error = `groupRules[${index}].name must be a string`;
                return;
            }

            // Validate that label is a non-empty string
            if (typeof rule.label !== 'string' || !rule.label.trim()) {
                error = `groupRules[${index}].label must be a string`;
                return;
            }
            
            // Validate that patterns is an array of valid regular expression strings
            if (!Array.isArray(rule.patterns)) {
                error = `groupRules[${index}].patterns must be an array`;
                return;
            }

            rule.patterns.forEach((pattern, patternIndex) => {
                // Skip further validation if an error has already been found
                if (error) return;

                if (typeof pattern !== 'string') {
                    error = `groupRules[${index}].patterns[${patternIndex}] must be a string`;
                    return;
                }

                try {
                    new RegExp(pattern);
                } catch (e) {
                    error = `groupRules[${index}].patterns[${patternIndex}] is not a valid regular expression: ${e.message}`;
                    return;
                }
            });
        });

        if (error) {
            return { valid: false, error };
        }

        return { valid: true, value: groupRules };

    }


    /**
     * @description Lifecycle method called when the component is added to the DOM. It calls the `connectedCallback` of the parent class to ensure proper lifecycle management.
     * @returns {void}
    */
    connectedCallback() {
        super.connectedCallback();

        // Ensure the observer and cookie state are initialized whenever the element is (re)attached.
        this.runCookieManager();
    }


 
    /**
     * @description Lifecycle method called when the component is removed from the DOM. It disconnects the MutationObserver to prevent memory leaks and calls the `disconnectedCallback` of the parent class.
     * @returns {void}
    */
    disconnectedCallback() {
        super.disconnectedCallback();

        if (this._cookieManagerObserver) {
            this._cookieManagerObserver.disconnect();
            this._cookieManagerObserver = null;
        }
  }

}

customElements.define('cork-cookie-manager', CorkCookieManager);