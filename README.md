# Cork Cookie Manager

This helps users remove unnecessary cookies (e.g. Google Analytics cookies on shared domains like `.ucdavis.edu`) that can contribute to request header size issues.

## Local Development

Install dependencies for the demo app:

```bash
cd app && npm install
```

Start the webpack watcher (rebuilds on file changes):

```bash
npm run watch
```

Or build the dist bundle (one-time build; does not watch for changes):

```bash
npm run dist
```

In a separate terminal, start the local HTTP server:

```bash
npm run serve
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## Usage

Call the library in the lit element. This can include properties **group-rules** to define how the cookies are grouped in viewing and **parent-domain** to define the parent domain that the cookies should be deleted from.

Can add group rules config to through the script tag in the element or as an attribute tag listed above.  The order of priority is first script config, then attribute config, and if neither are present the default config: 
```javascript
    name: "all"
    label: "All non-HttpOnly cookies"
    patterns: [".*"]
```

An example usage of this element:

### With Script Config

```javascript
import '@ucdlib/cork-cookie-manager'
  
  this.parentDomain = "app.local.test";

  <cork-cookie-manager>
    <script type="application/json">
      {
        "groupRules": [
          {
            "name": "googleAnalytics",
            "label": "Google Analytics",
            "patterns": ["^_ga", "^_gid", "^_gat", "^_ga_"]
          },
          {
            "name": "other",
            "label": "Other",
            "patterns": [".*"]
          }
        ]
      }
  </script>
</cork-cookie-manager>
```

### With Attribute Config

```javascript
import '@ucdlib/cork-cookie-manager'
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
            "name": "attributeOther",
            "label": "Other",
            "patterns": [".*"]
          }
        ];
    
  this.parentDomain = "app.local.test";

  <cork-cookie-manager 
    .groupRules="${this.groupRules)}"  
    .parentDomain="${this.parentDomain}">
  </cork-cookie-manager>
```


### HTTPOnly 

This tool only manages cookies accessible via JavaScript. HttpOnly cookies cannot be viewed or removed.

### Grouping Behavior
Cookies are assigned to the first group whose regex matches the cookie name.  The name is a unique identifier for internal use.  The label is what is shown for the UI.  If no cookie grouping behavior it all goes into **All Cookies**.

### Parent-domain Delete Attempts
Cookies will automatically try to delete from the parent domain of where you are calling this element.  It will receive the hostname, and if it is in localhost, an IPv4 address, or there is no parent domain to return, then it will return a blank string and collect cookies/delete from where it is placed.

However if you feed in the parent domain name from the attributes of the element it will use that.

### Importing Rules
To import rules from the published package entry point: 

```bash
import { rules } from '@ucdlib/cork-cookie-manager';;
```

then can demonstrate rules used in the app:

```javascript
  render() {
    return html`
      <h4>${rules.length} Exported Rule(s):</h4>
      ${rules.map(rule => html`
        <div>
          <h5>${rule.label}</h5>
          <p><strong>Patterns:</strong> ${rule.patterns.join(', ')}</p>
        </div>
      `)}
    `;
  }
```

