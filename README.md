# Entry Door Meta-Product Builder

A modern, responsive CPQ Meta-Product Builder web app designed for structuring Entry Door features, hierarchical options, dependency rules, whitelists, blacklists, and Autobahn system exports.

## Features

- **Primary Feature Hierarchy (2961):** Visual tree UI for organizing Entry Door features, categories, and options.
- **Bulk Option Import:** Instantly split comma, semicolon, or newline delimited lists into individual features.
- **Feature Detail Drawer (2962):** Manage requirement flags, component data types, and view feature-constraint relationships.
- **Constraint Management (2963 & 2965):** Centralized dashboard for logic rules, whitelists, and blacklists with affected feature tracking.
- **Interactive Rule Engine Test (2966):** Real-time conflict checking and validation log evaluator.
- **Autobahn Export Generator (2969):** Dynamic JSON schema generator for downstream catalog integrations.

## Getting Started

Simply clone this repository and open `index.html` in any web browser, or serve it locally using standard static servers.

### Local Development

```bash
# Clone repository
git clone [https://github.com/your-username/entry-door-builder.git](https://github.com/your-username/entry-door-builder.git)

# Navigate into project directory
cd entry-door-builder

# Run a simple local server (Node.js example)
npx serve .
