import { LitElement } from 'lit';
import {render, styles} from './cork-cookie-manager.tpl.js';
import {MutationObserverController} from "@ucd-lib/theme-elements/utils/controllers";
import './cork-cookie-alert.js';
/**
 * @description For managing cookies in a web application, allowing for grouping based on configurable rules and deletion of individual or grouped cookies.
 * @params {Array} groupRules - An array of rule objects for grouping cookies.
 * @params {String} parentDomain - The parent domain to target for cookie deletion across subdomains. If not provided, it will be auto-detected.
 * @params {Boolean} isDev - A flag indicating whether the application is in development mode.
 * @example
 * <cork-cookie-manager group-rules="${JSON.stringify(this.groupRules)}"  parent-domain="${this.parentDomain}">
 *     <script type="application/json">
 *       {
 *         "groupRules": [
 *           {
 *             "name": "analytics",
 *             "label": "Analytics Cookies",
 *             "patterns": ["analytics.*"]
 *           }
 *         ]
 *       }
 *     </script>
 *   </cork-cookie-manager>
 * @returns {void}
 */
export default class CorkCookieManager extends LitElement {

  static get properties() {
    return {
        groupRules: {type: Array, attribute: 'group-rules'},
        parentDomain: {type: String, attribute: 'parent-domain'},
        cookies: {type: Object},
        isDev: {type: Boolean, attribute: 'is-dev'}
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
    this.isDev = false;
    this._groupRules = this._compileGroupRules(this.defaultGroupRules);
    this._cookieManagerObserver = new MutationObserverController(
        this,
        {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['group-rules']
        },
        '_onCookieMutation'
    );
  }

    /*
        * Lifecycle method called after the component's DOM has been updated for the first time.
    */
    firstUpdated() {
        this.runCookieManager();
    }


    /**
     * @description Callback function for the MutationObserver that checks if relevant mutations have occurred 
     * and triggers a sync of group rules if necessary.
     * @param {Array} mutations 
     * @returns {void}
     */
    _onCookieMutation(mutations) {
        if (!mutations || !mutations.length) return;

        let shouldSync = false;

        for (const mutation of mutations) {
            if (
            mutation.type === 'childList' ||
            (mutation.type === 'attributes' && mutation.attributeName === 'group-rules') ||
            mutation.type === 'characterData'
            ) {
            shouldSync = true;
            break;
            }
        }

        if (shouldSync) {
            this._syncGroupRules();
        }
    }


  updated(changedProperties) {

    // If groupRules property has changed, sync it with the cookie manager content
    if (changedProperties.has('groupRules')) {

        const rawRules = this.groupRules ?? this.defaultGroupRules;
        this._groupRules = this._compileGroupRules(rawRules);
        this.getCookies();

    }
  }

  /**
   * @description Initializes the cookie manager by setting up the MutationObserver to watch for changes in the cookie manager's content 
   * and performs sync 
   * @returns {void}
   */
  runCookieManager() {

    // Initial sync of group rules from cookie manager content
    this._syncGroupRules();  

     // Initial retrieval of cookies after the component has been rendered
    this.getCookies();  

  }

  /**
   * @description Synchronizes the `groupRules` property with the current content of the cookie manager. 
   * It retrieves the group rules from either a JSON script tag or an attribute, validates them, and updates the `groupRules` property if they have changed.
   * @returns {void}
  */
  _syncGroupRules() {
    const scriptRules = this._getGroupRulesFromCookieManager();
    const resolvedRules = scriptRules ?? this.groupRules ?? this.defaultGroupRules;


    if (!this._groupRulesEqual(this.groupRules, resolvedRules)) {
        this.groupRules = resolvedRules; // raw rules
    }
  }

  _compileGroupRules(rules){
        return (rules || []).map(rule => ({
            ...rule,
            compiledPatterns: (rule.patterns || []).map(p => new RegExp(p)) 
        }))
 }

 /**
   * @description Retrieves group rules from the cookie manager's content.
   * @param {HTMLElement} cookieManager - The cookie manager element to retrieve group rules from.
   * @returns {Array} An array of group rule objects.
  */
  _getGroupRulesFromCookieManager() {
    // Get group rules from Json inside script tag
    const scriptTag = this.querySelector('script[type="application/json"]');


    if (!scriptTag?.textContent?.trim()) {
        return null;
    }

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

    // Return default group rules if no valid rules found
    return null;
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
     * @description Deletes a cookie when the delete button is clicked
     * @param {Event} e - Click event from the delete button
     * @returns {void}
     */
    deleteCookie(e) {        
        const cookieName = e.currentTarget.dataset.cookieName;
        this.performDelete(cookieName);
        const success = this.refreshCookies(cookieName);

        if (!success) {
            this.showAlert({header: 'Warning: Unable to Remove Cookie', message: 'Cookie could not be removed (domain/path mismatch or HttpOnly): ' + cookieName, timeout: 200, duration: 3000});
        }
    }

    /**
     * @description Displays an alert message using the CorkCookieAlert component.
     * @param {Object} options - An object containing options for the alert, such as `message`, `brandColor`, and `timeout`.
     */
    showAlert(options) {
        const alertElement = this.renderRoot?.querySelector('cork-cookie-alert');
        alertElement?.onAlert(options);
    }

    /**
     * @description Deletes all cookies in a specified group.
     * @param {Event} e - Click event from the delete group button
     * @returns {void}
     */
    _onDeleteAllCookiesClick(e) {
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
            this.showAlert({header: 'Warning: Unable to Remove Cookies', message: 'Some cookies could not be removed (domain/path mismatch or HttpOnly): ' + failed.join(', '), timeout: 200, duration: 3000});
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

        const allCookies = Object.values(this.cookies || {}).flat();

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
            return { valid: false, error: 'GroupRules must be an array.' };
        }

        groupRules.forEach((rule, index) => {
            // Skip further validation if an error has already been found
            if (error) return; 

            // Validate that each rule is an object
            if (!rule || typeof rule !== 'object') {
                error = `GroupRules[${index}] is not a valid object.`;
                return;
            }

            // Validate that name is a non-empty string
            if (typeof rule.name !== 'string' || !rule.name.trim()) {
                error = `GroupRules[${index}].name must be a string.`;
                return;
            }

            // Validate that label is a non-empty string
            if (typeof rule.label !== 'string' || !rule.label.trim()) {
                error = `GroupRules[${index}].label must be a string.`;
                return;
            }
            
            // Validate that patterns is an array of valid regular expression strings
            if (!Array.isArray(rule.patterns)) {
                error = `GroupRules[${index}].patterns must be an array.`;
                return;
            }

            rule.patterns.forEach((pattern, patternIndex) => {
                // Skip further validation if an error has already been found
                if (error) return;

                if (typeof pattern !== 'string') {
                    error = `GroupRules[${index}].patterns[${patternIndex}] must be a string.`;
                    return;
                }

                try {
                    new RegExp(pattern);
                } catch (e) {
                    error = `GroupRules[${index}].patterns[${patternIndex}] is not a valid regular expression: ${e.message}.`;
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
    const rules = this._groupRules ?? this._compileGroupRules(this.defaultGroupRules);
        for (const groupRule of rules) {
            const patterns = groupRule.compiledPatterns ?? (groupRule.patterns || []).map(p => new RegExp(p));

            for (const regex of patterns) {
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