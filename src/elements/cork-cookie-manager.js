import { LitElement } from 'lit';
import {render, styles} from './cork-cookie-manager.tpl.js';

import { Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';
import { LitCorkUtils } from '@ucd-lib/cork-app-utils';

export const rules = [{
    "name": "googleAnalytics",
    "label": "Google Analytics",
    "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
}];
 
export default class CorkCookieManager extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
        groupRules: {type: Array, attribute: 'group-rules'},
        parentDomain: {type: String, attribute: 'parent-domain'},
        cookies: {type: Object},
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.cookies = {};
    this.defaultGroupRules = [{
        name: "all",
        label: "All non-HttpOnly cookies",
        patterns: [".*"]
    }];
    this.groupRules = null;
    this._cookieManagerObserver = null;
    this.parentDomain = "";
    this.isDev = globalThis.process?.env?.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  }

/**** This section is to test the deletion button for cookies and groups and will be removed in the future */

/**
 * @description Creates test cookies for demonstration purposes. Only in dev environments.
 * @returns {void}
 */
createTestCookies() {
  if(!this.isDev) {
    console.warn('createTestCookies should only be used in development environments');
    return;
  }
  const parentDomain = this.parentDomain || this.getParentDomain();
  console.log('Creating test cookies with parent domain:', parentDomain);

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

  // Refresh UI
  this.getCookies();

  console.log("Test cookies created");
}

/********************************************************************************************************* */

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
        this.groupRules = this._cloneGroupRules(resolvedRules);
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
    return this.defaultGroupRules;
  }

    /**
   * @description Safely clones the provided group rules, using structuredClone when available
   * and falling back to JSON-based deep cloning otherwise.
   * @param {Array} rules - The group rules to clone.
   * @returns {Array} A cloned copy of the input rules.
   */
  _cloneGroupRules(rules) {
    // Prefer globalThis.structuredClone if available
    try {
      if (typeof globalThis !== 'undefined' && typeof globalThis.structuredClone === 'function') {
        return globalThis.structuredClone(rules);
      }
    } catch (e) {
      // Fall through to other strategies
    }
    // Fallback to bare structuredClone if defined in the global scope
    if (typeof structuredClone === 'function') {
      return structuredClone(rules);
    }
    // Last-resort deep clone for plain data (arrays/objects)
    return JSON.parse(JSON.stringify(rules));
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
        this.cookies = {};
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
            return { name, value: safeValue, valueLength: safeValue.length, ...this.checkCookieGroup({name}) };
        });


    this.cookies = parsedCookies.reduce((groups, cookie) => {
        const { groupLabel } = cookie;

        if (!groups[groupLabel]) {
            groups[groupLabel] = [];
        }

        groups[groupLabel].push(cookie);
        return groups;

    }, {});

    this.requestUpdate();
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
    /*
     * @description Returns the subset of cookie names that are still present in `document.cookie`.
     * @param {string[]} cookieNames - The cookie names to check.
     * @returns {string[]}
     */
    getRemainingCookieNames(cookieNames) {
        const existingCookieNames = new Set(
            document.cookie
                .split(';')
                .map(cookie => cookie.trim())
                .filter(Boolean)
                .map(cookie => cookie.split('=')[0])
        );
        return cookieNames.filter(cookieName => existingCookieNames.has(cookieName));
    }

   /**
     * @description Deletes a cookie by name when the delete button is clicked by calling performDelete 
     * @param {{name: string}} e - Cookie object to act on. Currently only the `name` property is used.
     * @returns {void}
   */
    deleteCookie(e) {
        const cookieName = e.currentTarget.dataset.cookieName;
        this.performDelete(cookieName);
        const success = this.refreshCookies(cookieName);

        if (!success) {
            console.warn('Some cookies could not be removed (domain/path mismatch or HttpOnly).', cookieName);
            // You could implement additional UI feedback here to indicate which cookies failed to delete, in AppStateModel.

        }
    }

    /**
     * @description Deletes all cookies in a specified group.
     * @param {string} groupLabel - The label of the group whose cookies to delete.
     * @returns {void}
     */
    deleteAllCookies(e) {
        const groupLabel = e.currentTarget.dataset.groupLabel;
        const cookies = this.cookies[groupLabel] || [];
        const cookieNames = cookies.map(cookie => cookie.name);
        const failed = [];

        cookies.forEach(cookie => {
            this.performDelete(cookie.name);
        });

        const success = this.refreshCookies(cookieNames);
        if (!success) {
            failed.push(...this.getRemainingCookieNames(cookieNames));
        }


        if (failed.length) {
            console.warn('Some cookies could not be removed (domain/path mismatch or HttpOnly).', failed);
            // You could implement additional UI feedback here to indicate which cookies failed to delete, in AppStateModel.

        }

    }

    /**
     * @description Deletes a cookie by name and sets the cookie's expiration date to a past date and specify the path and domain to ensure proper deletion.
     * @param {string} cookieName - The name of the cookie to delete.
     * @returns {void}
     */
    performDelete(cookieName) {
        const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
        const parentDomain = this.parentDomain || this.getParentDomain(); 

        //   Attempt deletes
        document.cookie = `${cookieName}=; expires=${expires}; path=/;`;

        // Attempt parent domain delete if parent domain exists
        if (parentDomain) {
            const parentDomainDelete = `${cookieName}=; expires=${expires}; path=/; domain=${parentDomain};`;
            document.cookie = parentDomainDelete;
            if (this.isDev) {
                console.log('Parent-domain delete attempt:', parentDomainDelete);
            }
        }
    }

    /**
     * @description Refreshes the cookie list after deletion and checks if the specified cookie still exists.
     * @param {string} cookieNames - The names of the cookies to check for existence after deletion. Can be a single cookie name or an array of cookie names.
     * @returns {boolean} Returns true if the cookie no longer exists, false if it still exists.
     */
    refreshCookies(cookieNames) {
        // Refresh the cookie list after deletion
        this.getCookies();

        const allCookies = Array.isArray(this.cookies)
            ? this.cookies
            : Object.values(this.cookies || {}).flat();

        const cookieNamesArray = Array.isArray(cookieNames) ? cookieNames : [cookieNames];
        const stillExists = cookieNamesArray.some(cookieName => allCookies.some(cookie => cookie.name === cookieName));
        return !stillExists;
    }

    /**
     * @description Validates the structure and content of group rules. 
     * @param {Array} groupRules - The group rules to validate.
     * @returns {Object} An object containing a `valid` boolean and either a `value` with the validated group rules or an `error` message if validation fails.
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
     * @description Determines the group label for a given cookie based on the defined group rules
     * @param {Object} cookie 
     * @returns {String}
     */    
    checkCookieGroup(cookie){
        for (const groupRule of this.groupRules) {
            for (const pattern of groupRule.patterns) {
                const regex = new RegExp(pattern);
                if (regex.test(cookie.name)) {
                    return {groupName: groupRule.name, groupLabel: groupRule.label};
                }
            }
        }
        return {groupName: "all-cookies", groupLabel: "All Cookies"};
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