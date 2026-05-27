import { rules } from '../../../src/browser.js';
import CorkTestCookies from '../../../src/elements/cork-test-cookies.js';
customElements.define('cork-test-cookies', CorkTestCookies);

import {html, css} from 'lit';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }
    `;

    return [elementStyles];
}

export function render() {
    return html`



    <h1>${rules.length} Exported Rule(s):</h1>
    ${rules.map(rule => html`
        <div>
            <h2>${rule.label}</h2>
            <p><strong>Patterns:</strong> ${rule.patterns.join(', ')}</p>
        </div>
    `)}
    ${this.isDev ? html`
        <cork-test-cookies .parentDomain="${this.parentDomain}"></cork-test-cookies>
    ` : ''}  
    <cork-cookie-manager is-dev="${this.isDev}" .groupRules="${this.groupRules}" .parentDomain="${this.parentDomain}">
    </cork-cookie-manager>

        
    `;
}
