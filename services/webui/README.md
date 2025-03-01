# React GenAI Prototyping Template

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Tags:** `react` `genai` `prototype` `frontend` `ui` `template`

This template offers a streamlined way to build user interfaces for your Generative AI projects. It focuses on providing a solid, easily adaptable React frontend, allowing you to concentrate on the core AI functionality of your application. It's designed for teams (especially those with mostly backend expertise) who need to quickly create functional and visually appealing prototypes.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Key Features](#key-features)
3.  [Getting Started](#getting-started)
4.  [Contributing](#contributing)
5.  [Directory Structure](#directory-structure)

## Key Features <a name="key-features"></a>

- **A curated set of UI components:** Ready-to-use components specifically tailored for common GenAI use cases (search, chat, input handling, etc.).
- **Ready to use interface examples:** "Search" and "Chat" demonstrate how to integrate the components into complete UIs.
- **Easy customization and extension:** Built with Tailwind CSS and a modular structure for simple styling and component additions.

## Getting Started <a name="getting-started"></a>

1.  **Clone the Repository:**

    ```bash
    git clone https://gitlab.com/google-cloud-ce/communities/genai-fsa/canada/copier-demo-template.git
    ```

2.  **cd** into project directory
    ```bash
      cd services/webui-react/
    ```
3.  **Install Dependencies:**

    ```bash
    npm install
    ```

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    This will start the development server, and you can access the application at `http://localhost:3000` (or a similar local port).

## Contributing <a name="contributing"></a>

We welcome contributions from the community! There are two main ways to contribute to this project:

1.  **Contribute a Full Application UI:**

    Create a new GenAI application user interface using this template and add it to our list of example applications. This is a great way to scale the team's technical assets and help others get started with building GenAI apps FAST. Make sure your application:

    - Uses the components provided in this template.
    - Is well-documented, with clear instructions on how to run it.
    - Includes a brief description of its functionality.

2.  **Contribute a UI Component:**

    Scale the template by adding new UI components that are useful for GenAI applications. Ensure your component:

    - Is well-documented, following the style of the existing components.
    - Is reusable and customizable.
    - Includes clear usage examples.
    - Is added to the `/components` route with appropriate documentation.

Please follow our contribution guidelines (link to a `CONTRIBUTING.md` file if you have one) when submitting your pull request. We look forward to your contributions! If you don't have a separate `CONTRIBUTING.md`, consider adding a section here with more specific guidelines (e.g., coding style, commit message conventions, testing requirements).
