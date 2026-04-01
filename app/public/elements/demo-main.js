import { LitElement } from 'lit';
import {render, styles} from './demo-main.tpl.js';

import { Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';
import { LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class DemoMain extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

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
    // this.groupRules = [
    //     {
    //       "name": "googleAnalytics",
    //       "label": "Google Analytics",
    //       "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
    //     },
    //     {
    //       "name": "attributeOther",
    //       "label": "Other",
    //       "patterns": [".*"]
    //     }
    //   ];
    // this.groupRulesProp = [
    //     {
    //       "name": "googleAnalytics",
    //       "label": "Google Analytics",
    //       "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
    //     },
    //     {
    //       "name": "propertyeOther",
    //       "label": "Other",
    //       "patterns": [".*"]
    //     }
    //   ];
    // this.parentDomain = "example.com";

  }

  connectedCallback() {
    super.connectedCallback();
  }

}

customElements.define('demo-main', DemoMain);