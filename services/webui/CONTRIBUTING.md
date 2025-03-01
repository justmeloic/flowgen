# Contributing to React GenAI Prototyping Template

We welcome contributions from the community! Whether you're fixing bugs, adding new features, or improving documentation, your help is greatly appreciated. This document outlines the guidelines for contributing to this project.

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Ways to Contribute](#ways-to-contribute)
    - [Contributing a Full Application UI](#contributing-a-full-application-ui)
    - [Contributing a UI Component](#contributing-a-ui-component)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Improving Documentation](#improving-documentation)
3.  [Development Workflow](#development-workflow)
    - [Forking and Cloning](#forking-and-cloning)
    - [Branching](#branching)
    - [Making Changes](#making-changes)
    - [Testing](#testing)
    - [Code Style](#code-style)
    - [Commit Messages](#commit-messages)
    - [Submitting a Pull Request](#submitting-a-pull-request)
4.  [Code of Conduct](#code-of-conduct)

## 1. Getting Started <a name="getting-started"></a>

Before contributing, please take a moment to review the [README.md](README.md) file to understand the project's purpose, structure, and setup instructions. Familiarize yourself with the existing codebase and the technologies used (React, Tailwind CSS).

## 2. Ways to Contribute <a name="ways-to-contribute"></a>

There are several ways you can contribute to this project:

### 2.1 Contributing a Full Application UI <a name="contributing-a-full-application-ui"></a>

This involves creating a complete, functional user interface for a Generative AI application using the components and structure provided by this template. Your application should:

- **Utilize existing components:** Make effective use of the pre-built components in the `src/components` directory.
- **Be well-documented:** Include clear instructions on how to run your application, including any necessary setup steps or dependencies.
- **Have a clear description:** Provide a concise explanation of your application's functionality and purpose. Include this in your pull request and consider adding a dedicated README.md within your application's directory.
- **Follow the project's structure:** Place your application's code within a new, appropriately named directory under the `src/app` directory (or a similar, agreed-upon location).
- **Include Example Prompts if needed** if your demo requires a specific input, give an example.
- **Illustrate multiple use cases:** if possible, add examples of different features the application offers.

### 2.2 Contributing a UI Component <a name="contributing-a-ui-component"></a>

This involves creating a new, reusable UI component that is relevant to Generative AI applications. Your component should:

- **Be well-documented:** Include clear documentation on how to use the component, including any props it accepts and their expected types. Use JSDoc comments within your component's code.
- **Be reusable and customizable:** Design the component to be flexible and adaptable to different use cases. Use props to allow users to customize its behavior and appearance.
- **Include usage examples:** Provide clear examples of how to use the component in a variety of scenarios. This could be within the component's documentation or in a separate example file.
- **Be placed in the correct directory:** Add your component to the `src/components` directory.
- **Follow existing component patterns:** Maintain consistency with the style and structure of the existing components.
- **Be thoroughly tested:** If applicable, include unit tests for your component.
- **Be accessible:** follow accessibility best-practices.

### 2.3 Reporting Bugs <a name="reporting-bugs"></a>

If you find a bug, please report it by opening a new issue on GitLab. Include the following information in your bug report:

- **A clear and descriptive title.**
- **A detailed description of the bug.**
- **Steps to reproduce the bug.**
- **The expected behavior.**
- **The actual behavior.**
- **Your operating system and browser (if applicable).**
- **Screenshots or videos (if helpful).**

### 2.4 Suggesting Enhancements <a name="suggesting-enhancements"></a>

If you have an idea for a new feature or improvement, please suggest it by opening a new issue on GitLab. Include the following information in your enhancement request:

- **A clear and descriptive title.**
- **A detailed description of the enhancement.**
- **The benefits of implementing the enhancement.**
- **Any potential drawbacks or challenges.**
- **Examples of how the enhancement could be used.**

### 2.5 Improving Documentation <a name="improving-documentation"></a>

Clear and comprehensive documentation is crucial for any project. You can contribute by:

- **Fixing typos or grammatical errors.**
- **Clarifying existing documentation.**
- **Adding missing documentation.**
- **Improving the overall organization and readability of the documentation.**

## 3. Development Workflow <a name="development-workflow"></a>

Follow these steps to contribute code:

### 3.1 Forking and Cloning <a name="forking-and-cloning"></a>

1.  **Fork the repository:** Click the "Fork" button on the top right of the repository page on GitLab. This creates a copy of the repository in your own GitLab account.
2.  **Clone your fork:** Clone the forked repository to your local machine:

    ```bash
    git clone [https://gitlab.com/](https://gitlab.com/)<your-username>/communities/genai-fsa/canada/copier-demo-template.git
    cd copier-demo-template
    cd services/webui-react
    ```

    Replace `<your-username>` with your GitLab username. **Note:** The cloning URL and subsequent `cd` commands are specific to _this_ project and its directory structure.

### 3.2 Branching <a name="branching"></a>

Create a new branch for your work. Use a descriptive branch name that reflects the feature or bug fix you're working on:

```bash
git checkout -b feature/my-new-feature
git checkout -b fix/bug-description
git checkout -b docs/improve-readme
```
