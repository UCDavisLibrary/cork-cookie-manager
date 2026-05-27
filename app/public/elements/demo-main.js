import { LitElement } from 'lit';
import {render, styles} from './demo-main.tpl.js';

import { Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';

/**
 * @description Main demo element for cookie manager. 
 * Displays the cookie manager and test cookies in a development environment, 
 * and just the cookie manager in production.
 */
export default class DemoMain extends Mixin(LitElement)
  .with(MainDomElement) {

  static get properties() {
    return {
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.isDev = true;
    this.groupRules = [
        {
          "name": "testGroup",
          "label": "Test Group",
          "patterns": [".*test.*"]
        },
        {
          "name": "googleAnalytics",
          "label": "Google Analytics",
          "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
        },
        {
          "name": "wordpress",
          "label": "Wordpress",
          "patterns": ["^wp-"]
        },
        {
          "name": "attributeOther",
          "label": "Other",
          "patterns": [".*"]
        }
      ];

      this.parentDomain = "app.local.test";
  }

}

customElements.define('demo-main', DemoMain);