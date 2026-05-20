import {html, css} from 'lit';
import baseStyles from '@ucd-lib/theme-sass/1_base_html/_index.css.js';
import baseClassStyles from '@ucd-lib/theme-sass/2_base_class/_index.css.js';
import baseComponent from '@ucd-lib/theme-sass/4_component/_index.css.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-collapse/ucd-theme-collapse.js';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }

        .alert {            
            opacity: 0;
            max-height: 0;
            padding:0;
            overflow: hidden;
            transition: opacity 0.5s ease-out, 
                max-height 0.3s ease-out 0.5s, 
                padding 0.3s ease-out 0.5s;
        }

        .alert.is-visible {
            opacity: 1;
            padding: 32px;
            max-height: 200px; 
            transition: max-height 0.3s ease-in, 
                padding 0.3s ease-in, 
                opacity 0.5s ease-in 0.2s;        
        }

        .cookie-grid {
            display: block;
        }

        .grid-header,
        .grid-row {
            display: grid;
            grid-template-columns: .5fr 1fr .25fr;
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

        .mobile-label {
            display: none;
            font-weight: bold;
            flex: 0 0 auto;
            white-space: nowrap;
        }
        .cookie-name {
            flex: 1 1 auto;
            min-width: 0;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        @media (max-width: 580px) {
            .mobile-label {
                display: inline-block;
            }

            .grid-cell--actions .category-brand--double-decker,
            .grid-cell--actions .alignable-promo,
            .grid-cell--actions .alignable-promo__wrapper,
            .grid-cell--actions .alignable-promo__body,
            .grid-cell--actions .alignable-promo__buttons {
                width: 100%;
            }

            .grid-cell--actions .alignable-promo__buttons {
                display: flex;
                justify-content: center;
            }
            .cookie-grid {
                display: block;

            .grid-header {
                display: none;
            }

            .grid-row {
                display: block;
                border-bottom: 1px solid #ddd;
                margin-bottom: 1em;
                padding: 0.5em 0;
            }

            .grid-row > div {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 6px 8px;
                gap: 0.75rem;
            }

            .grid-cell--actions {
                padding: 0;
            }

            .grid-cell--actions button {
                width: 100%;
            }

            .grid-cell--name {
                flex: 1 1 auto;
                min-width: 0;
                overflow-wrap: anywhere;
                word-break: break-word;
            }

            .grid-cell--actions button {
                width: 100%;
            }

            .center-container {
                justify-content: space-between;
            }

        }
    `;

    return [baseStyles, baseClassStyles, baseComponent, elementStyles];
}


export function render() {
    return html`
        <h1>Cookies</h1>
                <div class="alert ${this.alertType} ${this.showAlert ? 'is-visible' : ''}" role="alert">
                    <div class="alert__inner">
                        <p>${this.alertMessage}</p>
                    </div>
                </div>
        
        ${this.cookies && Object.keys(this.cookies).length > 0 ? Object.entries(this.cookies).map(([groupLabel, cookies]) => html`
                <div class="group-header">
                    <button @click=${this._onDeleteAllCookiesClick}
                            data-group-label="${groupLabel}"
                            class="delete-all-btn" 
                            aria-label=${`Delete all cookies in group ${groupLabel}`}>
                        &#10006;
                    </button>
                    <ucd-theme-collapse title="${groupLabel} - ${cookies.length} Cookies">
                        <div class="cookie-grid" role="region" aria-label="List of cookies in group ${groupLabel}">
                            <div class="grid-header" role="row">
                                <div class="center-container" role="columnheader">Delete?</div>
                                <div role="columnheader">Cookie Name</div>
                                <div role="columnheader">Cookie Length</div>
                            </div>
                            
                            ${cookies.map(cookie => html`
                                <div class="grid-row" role="row">
                                    <div class="grid-cell grid-cell--actions center-container" role="gridcell">     
                                        <div class="category-brand--double-decker">
                                            <div class="alignable-promo">
                                                <div class="alignable-promo__wrapper">
                                                    <div class="alignable-promo__body">
                                                        <div class="alignable-promo__buttons">
                                                            <button 
                                                            @click=${this.deleteCookie} 
                                                            data-cookie-name="${cookie.name}"
                                                            aria-label=${`Delete cookie ${cookie.name}`}
                                                            class="btn btn--primary">
                                                            Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>  
                                    </div>

                                    <div class="grid-cell grid-cell--name" role="gridcell">
                                        <span class="mobile-label">Name:</span>
                                        <span class='cookie-name'>${cookie.name}</span>
                                    </div>

                                    <div class="grid-cell grid-cell--length" role="gridcell">
                                        <span class="mobile-label">Length:</span>
                                        <span>${cookie.valueLength}</span>
                                    </div>
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

