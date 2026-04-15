import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-search-popup/ucd-theme-search-popup.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-search-form/ucd-theme-search-form.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-quick-links/ucd-theme-quick-links.js';
import '../../../src/elements/cork-cookie-manager.js';
import { rules } from '../../../src/elements/cork-cookie-manager.js';

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

    <ucd-theme-header
        prevent-fixed
        is-demo>

        <ucdlib-branding-bar>
            <a href="#">My Account</a>
            <a href="#">Access VPN</a>
            <a href="#">Give</a>
        </ucdlib-branding-bar>

        <ucd-theme-primary-nav>
            <ul link-text="Cookie Manager" href="#">
            <li><a href="#">Instructions</a></li>
            <li><a href="#">Application</a></li>
            </ul>
        </ucd-theme-primary-nav>

        <ucd-theme-search-popup>
            <ucd-theme-search-form
            @search="e=>console.log(e.detail.searchTerm)">
            </ucd-theme-search-form>
        </ucd-theme-search-popup>

    </ucd-theme-header>


    <h4>${rules.length} Exported Rule(s):</h4>
    ${rules.map(rule => html`
        <div>
            <h5>${rule.label}</h5>
            <p><strong>Patterns:</strong> ${rule.patterns.join(', ')}</p>
        </div>
    `)}
    <cork-cookie-manager group-rules="${JSON.stringify(this.groupRules)}">
    </cork-cookie-manager>

        
    `;
}
