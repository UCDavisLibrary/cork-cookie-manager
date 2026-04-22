import {html, css} from 'lit';
import baseStyles from '@ucd-lib/theme-sass/1_base_html/_index.css.js';
import baseClassStyles from '@ucd-lib/theme-sass/2_base_class/_index.css.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-collapse/ucd-theme-collapse.js';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }

        .cookie-grid {
            display: grid;
            grid-template-columns: auto 1fr .25fr;
        }

        .grid-header, .grid-row {
            display: contents;
        }

        .grid-header > div {
            font-weight: bold;
            padding: 12px 8px;
            border-bottom: 2px solid #ffbf00;
        }

        .grid-row > div {
            padding: 12px 8px;
            min-height: 3.5em; 
            align-self: center;
        }

        .center-container {
            text-align: center;
        }

        .delete-cookie-button {
             background-color: #c10230;
             border: 1px solid red;
             color: white;
             cursor: pointer;
        }

        .group-header {
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
        
        .test-button {
            margin-bottom:1em;
        }
    `;

    return [baseStyles, baseClassStyles, elementStyles];
}


export function render() {
    return html`
        <h1>Cookies</h1>

        ${this.isDev ? html`
            <div class="test-button">
                <button class="btn btn--lg" @click=${this.createTestCookies}>Create Test Cookies</button>
            </div>`
        : ''}

        ${this.cookies && (Array.isArray(this.cookies) ? this.cookies.length : Object.keys(this.cookies).length)
            ? Object.entries(this.cookies).map(([groupLabel, cookies]) => html`
                <div class="group-header">
                    <button @click=${this.deleteAllCookies}
                            data-group-label="${groupLabel}"
                            class="delete-all-btn" 
                            aria-label=${`Delete all cookies in group ${groupLabel}`}>
                        Delete Group
                    </button>
                    <ucd-theme-collapse title="${groupLabel} - ${cookies.length} Cookies">
                        <div class="cookie-grid" role="grid">
                            <!-- Header -->
                            <div class="grid-header" role="row">
                                <div class="center-container" role="columnheader">Delete?</div>
                                <div role="columnheader">Cookie Name</div>
                                <div role="columnheader">Cookie Length</div>
                            </div>
                            
                            <!-- Body Rows -->
                            ${cookies.map(cookie => html`
                                <div class="grid-row" role="row">
                                    <div class="center-container" role="gridcell">      
                                        <button 
                                            @click=${this.deleteCookie} 
                                            data-cookie-name="${cookie.name}"
                                            aria-label=${`Delete cookie ${cookie.name}`}
                                            class="btn btn--sm delete-cookie-button">
                                            Delete
                                        </button>
                                    </div>
                                    <div role="gridcell">${cookie.name}</div>
                                    <div role="gridcell">${cookie.valueLength}</div>
                                </div>
                            `)}
                        </div>
                    </ucd-theme-collapse>
                </div>
            `) 
            : html`<p>No cookies found.</p>`
        }
    `;
}

