# FlowGen Web UI: Frontend for AI-Powered Diagram Generation

[![Next.js](https://img.shields.io/badge/Next.js-14-blue?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justmeloic/flowgen/issues)

The `services/webui` directory holds the frontend application for FlowGen. This web-based interface allows users to provide natural language descriptions and upload supporting documentation, which FlowGen uses to generate architecture diagrams. The UI renders these diagrams using Mermaid.js.

## 🚀 Key Features

- **Intuitive Diagram Generation:** Easily create diagrams from text descriptions using a user-friendly interface.
- **Real-Time Preview:** See diagrams rendered in real-time as you type and refine your input.
- **File Upload Support:** Upload existing documentation files (e.g., `.txt`, `.md`) for automatic diagram generation.
- **Interactive Mermaid.js Rendering:** Visualize diagrams with the power of Mermaid.js, allowing for dynamic interaction and exploration.
- **Component-Based Architecture:** Built with reusable UI components for maintainability and scalability.
- **Responsive Design:** Works seamlessly on various devices and screen sizes.
- **Multiple Diagram Type**: the webui allow the user to select the kind of diagram that he wants to generate.
- **Terraform agent page**: A page has been created to manage the creation of terraform code, the page is still under developement.

## 🛠️ Technology Stack

The FlowGen Web UI is built with a modern and powerful tech stack:

- **Next.js 14:** A React framework that provides server-side rendering, static site generation, and other advanced features for building high-performance web applications.
- **TypeScript:** A superset of JavaScript that adds static typing, making the codebase more robust and maintainable.
- **Tailwind CSS:** A utility-first CSS framework that speeds up UI development and promotes consistency.
- **Shadcn/ui:** A collection of accessible and customizable UI components that are built on top of Radix UI and Tailwind CSS.
- **React Markdown:** A library for parsing and rendering Markdown content.
- **Mermaid.js:** A JavaScript library that allows for the creation of diagrams and flowcharts from text-based descriptions.
- **Lucide-react**: icon library.

## ⚙️ Development

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    This command starts the development server, and you can access the application in your browser at `http://localhost:3000`. The server supports hot reloading, so any changes you make to the code will be reflected in the browser automatically.

## 🧪 Testing

While specific test setup details aren't provided, it's recommended to add tests to the project. You can add test using:

- **Jest**: is a JavaScript testing framework.
- **React testing library**: a library that provide react specific utilities for testing.

## 🤝 Contributing

Contributions are welcome! There are two main ways to contribute:

1.  **Contribute a Full Application UI:**

    Create a new GenAI application user interface using the components in this template and add it to our list of example applications. This will help scale the team's technical assets and help others get started with building GenAI apps faster. Ensure your application:

    - Uses the components provided in this template.
    - Is well-documented, with clear instructions on how to run it.
    - Includes a brief description of its functionality.

2.  **Contribute a UI Component:**

    Expand the template by adding new UI components that are useful for GenAI applications. Ensure your component:

    - Is well-documented, following the style of the existing components.
    - Is reusable and customizable.
    - Includes clear usage examples.
    - Is added to the `/components` directory with appropriate documentation.

Please follow our [contribution guidelines](link-to-contributing-file-or-section) when submitting your pull request. If you don't have a separate `CONTRIBUTING.md`, consider adding a section here with more specific guidelines (e.g., coding style, commit message conventions, testing requirements).

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## 🧑‍💻 Author

**[Loïc Muhirwa](https://github.com/justmeloic/)**
