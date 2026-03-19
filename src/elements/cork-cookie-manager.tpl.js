import {html, css} from 'lit';
import baseStyles from '@ucd-lib/theme-sass/1_base_html/_index.css.js';
import baseClassStyles from '@ucd-lib/theme-sass/2_base_class/_index.css.js';
import objectsStyles from '@ucd-lib/theme-sass/3_objects/_index.css.js';
import componentStyles from '@ucd-lib/theme-sass/4_component/_index.css.js';
import layoutStyles from '@ucd-lib/theme-sass/5_layout/_index.css.js';
import utilityStyles from '@ucd-lib/theme-sass/6_utility/_index.css.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-collapse/ucd-theme-collapse.js';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }
        .center-container {
            display: flex; 
            justify-content: center; 
            align-items: center;
        }
        .delete-cookie-button {
             background-color: #c10230;
             border: 1px solid red;
             color: white;
        }
    `;

    return [    
        baseStyles,
        componentStyles,
        baseClassStyles,
        objectsStyles,
        layoutStyles,
        utilityStyles,
        elementStyles];
}

export function render() {
    return html`

        <h1>Cookies</h1>

        <ucd-theme-collapse title="Cookie Group Sample">
        <div class="responsive-table" role="region" aria-label="Scrollable Table" tabindex="0">
            <table class="table--bordered">
                <thead>
                    <tr>
                        <th class="center-container">Delete?</th>
                        <th>Cookie Name</th>
                        <th>Cookie Length</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.cookies.map(cookie => 
                        html`
                            <tr>
                                <td class="center-container">      
                                   <button 
                                        @click=${() => this.deleteCookie(cookie)} 
                                        aria-label=${`Delete cookie ${cookie.name}`}
                                        class="btn btn--sm delete-cookie-button"
                                        disabled>Delete</button>
                                </td>
                                <td>${cookie.name}</td>
                                <td>${cookie.valueLength}</td>
                            </tr>`
                        )}
                </tbody>
            </table>
        </div>
        </ucd-theme-collapse>

        
    `;
}
