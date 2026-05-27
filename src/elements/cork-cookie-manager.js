import { LitElement } from 'lit';
import {render, styles} from './cork-cookie-manager.tpl.js';
import {MutationObserverController} from "@ucd-lib/theme-elements/utils/controllers";

/**
 * @description For managing cookies in a web application, allowing for grouping based on configurable rules and deletion of individual or grouped cookies.
 * @params {Array} groupRules - An array of rule objects for grouping cookies.
 * @params {String} parentDomain - The parent domain to target for cookie deletion across subdomains. If not provided, it will be auto-detected.
 * @params {Boolean} isDev - A flag indicating whether the application is in development mode.
 * @example
 *   <cork-cookie-manager is-dev="${this.isDev}" .groupRules="${this.groupRules}" .parentDomain="${this.parentDomain}">
 *      <script type="application/json">
 *          {
 *              "groupRules": [
 *              {
 *                  "name": "analytics",
 *                  "label": "Analytics Cookies",
 *                  "patterns": ["analytics.*"]
 *              }
 *              ]
 *          }
 *      </script>
 *  </cork-cookie-manager>
 * @returns {void}
 */
export default class CorkCookieManager extends LitElement {

  static get properties() {
    return {
        groupRules: {type: Array, attribute: 'group-rules'},
        parentDomain: {type: String, attribute: 'parent-domain'},
        cookies: {type: Object},
        isDev: {type: Boolean, attribute: 'is-dev'},
        alertType: {type: String},
        alertMessage: {type: String},
        alerts: {type: Array},
        isProcessingAlert: {type: Boolean}
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
    this.alertType = "alert--error";
    this.alerts = [];
    this.alertMessage = "No message at this time.";
    this.isProcessingAlert = false;

    this._cookieManagerObserver = new MutationObserverController(
        this,
        {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
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

        this._syncGroupRules();

    }

  /**
    * @description LitElement lifecycle method called before updates.
    * @param {Map} changedProperties - A map of changed properties and their previous values.
    * @returns {void}
  */
  willUpdate(changedProperties) {
        if (changedProperties.has('groupRules')) {
            const validationResult = this.validateGroupRules(this.groupRules);
            const rawRules = validationResult.valid 
                                ? validationResult.value 
                                : this.defaultGroupRules;

            this._groupRules = this._compileGroupRules(rawRules);
            this.getCookies(); 
        }
        if (changedProperties.has('alerts')) {
            this.alertTimeout();
        }
    }

  /**
   * @description Initializes the cookie manager by syncing group rules from the cookie manager's 
   * content and retrieving the current cookies.
   * @returns {void}
   */
  runCookieManager() {

    this._syncGroupRules();  
    this.getCookies();  
  }

  /**
   * @description Handles the display of alert messages when cookies cannot be 
   * deleted. It processes the first alert in the queue, displays it 
   * for a set duration, and then removes it from the queue before allowing the next alert 
   * to be processed.
   * @returns {void}
   */
  alertTimeout(){
    if (this.isProcessingAlert || !this.alerts.length) return;
    this.isProcessingAlert = true;

    const current = this.alerts[0];
    this.alertType = current.type;
    this.alertMessage = current.message;

    this.showAlert = true;

    setTimeout(() => {
        this.showAlert = false;
        this.requestUpdate();

        setTimeout(() => {
            this.isProcessingAlert = false;
            this.alerts = this.alerts.slice(1);
        }, 500);

    }, 8000);

  }

  /**
   * @description Synchronizes the group rules by first attempting to retrieve them 
   * from the cookie manager's content (e.g., a script tag).
   * @returns {void}
  */
  _syncGroupRules() {
    const scriptRules = this._getGroupRulesFromCookieManager();

    if (scriptRules) {
        this.groupRules = scriptRules;
        return;
    }

    const propertyRules = this.validateGroupRules(this.groupRules);
    if (propertyRules.valid) {
        this.groupRules = propertyRules.value;
        return;
    }

    this.groupRules = this.defaultGroupRules;

  }

 /**
   * @description Compiles the group rules by converting the pattern strings into 
   * RegExp objects for efficient matching.
   * @param {Array} rules - The group rules to compile.
   * @returns {Array} The group rules with compiled patterns.
  */
  _compileGroupRules(rules){
        return (rules || []).map(rule => ({
            ...rule,
            compiledPatterns: (rule.patterns || []).map(p => new RegExp(p)) 
        }))
 }

 /**
   * @description Attempts to retrieve group rules from the cookie manager's content, 
   * such as a script tag containing JSON. 
   * @returns {Array|null} The group rules if found and valid, or null if not found or invalid.
  */
  _getGroupRulesFromCookieManager() {
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
   * @description Retrieves cookies from `document.cookie`, parses them, 
   * and groups them based on the defined group rules.
   * @returns {void|Array} The parsed and grouped cookies, or void if no cookies are found.
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
                    name = cookie.trim();
                    value = '';
                } else {
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
     * @description Retrieves the parent domain of the current page by extracting the 
     * last two segments of the hostname. It also includes checks to skip localhost and IPv4 addresses
    */
    getParentDomain() {
        const host = window.location.hostname;

        if (host === 'localhost') {
            return '';
        }

        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
            return '';
        }

        const parts = host.split('.');

        if (parts.length < 2) {
            return '';
        }

        return `.${parts.slice(-2).join('.')}`;

    }   
   /**
     * @description Filters the provided cookie names against the current 
     * cookies to determine which cookies still exist after a deletion attempt.
     * @param {Array} cookieNames - An array of cookie names to check for existence.
     * @returns {Array} An array of cookie names that still exist in `document.cookie`.
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
            let alertType = "alert--error";
            let alertMessage = 'Cookie could not be removed (domain/path mismatch or HttpOnly): ' + cookieName;
            let alert = {type: alertType, message: alertMessage};
            this.alerts = [...this.alerts, alert];
            this.requestUpdate();
        }
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
            let alertType = "alert--error";
            let alertMessage = 'Some cookies could not be removed (domain/path mismatch or HttpOnly): ' + failed.join(', ');
            let alert = {type: alertType, message: alertMessage};
            this.alerts = [...this.alerts, alert];
            this.requestUpdate();
        }

    }

    /**
     * @description Deletes a cookie by setting its expiration date to a past date. 
     * It attempts to delete the cookie for the current domain
     * @param {string} cookieName - The name of the cookie to delete.
     * @returns {void}
     */
    performDelete(cookieName) {
        const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
        const parentDomain = this.parentDomain || this.getParentDomain(); 

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
     * @description Refreshes the cookie list after a deletion attempt and checks if the 
     * specified cookies still exist.
     * @param {string} cookieNames - The names of the cookies to check for existence after deletion.
     * @returns {boolean} Returns true if the cookie no longer exists, false if it still exists.
     */
    refreshCookies(cookieNames) {
        this.getCookies();

        const allCookies = Object.values(this.cookies || {}).flat();

        const cookieNamesArray = Array.isArray(cookieNames) ? cookieNames : [cookieNames];
        const stillExists = cookieNamesArray.some(cookieName => allCookies.some(cookie => cookie.name === cookieName));
        return !stillExists;
    }

    /**
     * @description Validates the structure and content of the provided group rules to ensure 
     * they meet the expected format and contain valid regular expressions.
     * @param {Array} groupRules - The group rules to validate.
     * @returns {Object} An object containing a boolean `valid` property and either a `value` 
     * property with the valid group rules or an `error` property with an error message.
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
     * @description Checks which group a cookie belongs to based on the defined group rules. 
     * If no match is found, it defaults to "All Cookies".
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

}

customElements.define('cork-cookie-manager', CorkCookieManager);