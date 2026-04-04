import {html, css} from 'lit';
import baseStyles from '@ucd-lib/theme-sass/1_base_html/_index.css.js';
import baseClassStyles from '@ucd-lib/theme-sass/2_base_class/_index.css.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-collapse/ucd-theme-collapse.js';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }
        .center-container {
            text-align: center;
            vertical-align: middle;
        }
        .delete-cookie-button {
             background-color: #c10230;
             border: 1px solid red;
             color: white;
        }
        .groupHeader {
            display: flex;
            align-items: stretch;
            margin-bottom: 1em;
        }

        .delete-all-btn {
            flex: 0 0 auto;
            align-self: stretch;
            display: flex; 
            align-items: center;
            background-color: #c10230;
            padding: 0.5em 1em;
            color: white;
            border: 1.5px solid #c10230;
            border-right: none;

        }

         .delete-all-btn:hover {
            background-color: white;
            color: #a80025;
        }

        ucd-theme-collapse {
            flex: 1 1 auto;
            min-width: 0; 
        }
            `;

    return [    
        baseStyles,
        baseClassStyles,
        elementStyles];
}

export function render() {
    return html`
        <h1>Cookies</h1>

        <button @click=${this.createTestCookies}>Create Test Cookies</button>

        ${this.cookies ? Object.entries(this.cookies).map(([groupLabel, cookies]) =>
            html`
                <div class="groupHeader">
                    <button @click=${() => this.deleteAllCookies(groupLabel)} class="delete-all-btn" aria-label=${`Delete all cookies in group ${groupLabel}`}>
                        Delete All
                    </button>
                    <ucd-theme-collapse title="${groupLabel}">
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
                                    ${cookies.map(cookie => 
                                        html`
                                            <tr>
                                                <td class="center-container">      
                                                <button 
                                                        @click=${this.deleteCookie} 
                                                        data-cookie-name="${cookie.name}"
                                                        aria-label=${`Delete cookie ${cookie.name}`}
                                                        class="btn btn--sm delete-cookie-button"
                                                        >Delete</button>
                                                </td>
                                                <td>${cookie.name}</td>
                                                <td>${cookie.valueLength}</td>
                                            </tr>`
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </ucd-theme-collapse>
                </div>
            `
        ) : html`<p>No cookies found.</p>`}
    `;
}
