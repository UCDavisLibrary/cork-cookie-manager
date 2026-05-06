import { html, css } from 'lit';
import headingStyles from "@ucd-lib/theme-sass/1_base_html/_headings.css";
import headingClassesStyles from "@ucd-lib/theme-sass/2_base_class/_headings.css";
import buttonStyles from "@ucd-lib/theme-sass/2_base_class/_buttons.css";

/**
 * @description element styles
 * @returns
 */
export function styles() {
  const elementStyles = css`
    :host {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      
      /* Start Hidden */
      opacity: 0;
      visibility: hidden;

      /* FADE OUT SETTINGS (The "Default" state) */
      /* transition: property duration timing-function delay; */
      /* Delay visibility by 0.6s so it stays visible while opacity fades */
      transition: opacity 0.6s ease-out, 
                  visibility 0s linear 0.6s;
    }

    :host(.is-visible) {
      opacity: 1;
      visibility: visible;
      transition: opacity 0.3s ease-in, 
                  visibility 0s linear 0s;
    }

    
    alert-box {
      margin-bottom: 1em;
    }

    .alert-content {
      border-radius: 8px;
      padding: .5em;
      max-width: 600px;
      margin: 2em;
      color: black;
    }
    .alert-header {
      border-bottom: .05px solid rgba(0, 0, 0, 0.35);

      }

    .alert-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-header p {
      font-size: 1.5rem;
      margin-bottom: .15em;
    }

`;

  return [headingStyles, headingClassesStyles, buttonStyles, elementStyles];
}

export function render() {
  this.classList.toggle('is-visible', this.isVisible);

  return html`
    <div class="alert-content" style="border-color: ${this.brandColor}; background-color: ${this.brandColor}; ">
      <div class="alert-header">
        <p>${this.header}</p>
      </div>
      <div class="alert-box">
        <p>${this.message}</p>
      </div>
    </div>
  `;
}