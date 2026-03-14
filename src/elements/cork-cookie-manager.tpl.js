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
        <h1>Cookie Manager Elements</h1>
        <p>This is where the cookie manager elements will go.</p>
        <p>In progress. This is where the elements will be implemented.</p>
    `;
}
