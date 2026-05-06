import { LitElement } from 'lit';
import {render, styles} from './cork-cookie-alert.tpl.js';

/**
 * @description Component class for displaying a modal with slotted content
 */
export default class CorkCookieAlert extends LitElement {

  static get properties() {
    return {
        hidden: {type: Boolean},
        message: {type: String},
        brandColor: {type: String},
        isVisible: { type: Boolean, state: true }
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden = true;
    this.message = '';
    this._queue = [];
    this._isShowing = false;
    this.brandColor = '#ffbf00';
    this.isVisible = false;
    this.header = 'Cookie Manager Alert';
  }

  /**
   * @description Displays an alert message with optional styling and auto-hide functionality.
   * @param {Object} options - An object containing options for the alert:
   *   - message: The message to display in the alert (required).
   *   - brandColor: Optional border color for the alert.
   *   - timeout: Optional delay before showing the alert (default: 200ms).
   *   - duration: Optional duration to show the alert before auto-hiding (default: 5000ms).
   */
  onAlert(options){
    console.log('Alert options received:', options);
    if ( !options.message ) return;

    this._queue.push({
      message: options.message,
      brandColor: options.brandColor || '',
      timeout: options.timeout || 200,
      duration: options.duration || 5000,
      header: options.header
    })

    this._processQueue();
  }

  _processQueue() {
    if (this._isShowing || this._queue.length === 0) return;
    const next = this._queue.shift();

    this._isShowing = true;

    this.message = next.message;
    this.hidden = false;
    this.isVisible = true;
    this.header = next.header || 'Cookie Manager Alert';

    setTimeout(() => {
      this.hidden = true;
      this.isVisible = false;

      setTimeout(() => {
        this._isShowing = false;
        this._processQueue();
      }, 300);
    }, next.duration);
  }

  closeModal() {
    this.hidden = true;
  }



}

customElements.define('cork-cookie-alert', CorkCookieAlert);