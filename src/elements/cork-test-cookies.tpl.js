import {html, css} from 'lit';
import baseStyles from '@ucd-lib/theme-sass/1_base_html/_index.css.js';
import baseClassStyles from '@ucd-lib/theme-sass/2_base_class/_index.css.js';

export function styles() {
    const elementStyles = css`
        :host {
            display: block;
        }
    `;

    return [baseStyles, baseClassStyles, elementStyles];
}

export function render() {
    return html`
        <h2>Test Cookies</h2>
        <p>This page is for testing cookie deletion. It sets a few cookies that match the test group pattern and some that do not.</p>
        <div class="test-button">
            <button class="btn btn--lg" @click=${this.createTestCookies}>Create Test Cookies</button>
        </div>
    `;
}