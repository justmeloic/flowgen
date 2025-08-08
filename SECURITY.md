# Security Policy

## Supported Versions

We take security seriously and actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly. We appreciate your efforts to responsibly disclose any security concerns.

### How to Report

**Please do NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by emailing:

**loic.muhirwa@gmail.com**

### What to Include

When reporting a vulnerability, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations (if you have them)
- Your contact information for follow-up questions

### Response Timeline

We will acknowledge receipt of your vulnerability report within **48 hours** and will send you regular updates on our progress. We aim to:

- Acknowledge the report within 48 hours
- Provide an initial assessment within 7 days
- Release a fix or mitigation within 30 days (depending on complexity)

### Security Considerations

This project includes several security-relevant components:

- **Authentication System**: Simple header-based authentication with session management
- **API Endpoints**: FastAPI backend with middleware protection
- **File Access**: Configurable file access methods (local/GCS)
- **Environment Variables**: Sensitive configuration via environment files

### Security Best Practices

When deploying this application:

1. **Change Default Secrets**: Always change the default `AUTH_SECRET` in production
2. **Use HTTPS**: Deploy with TLS/SSL certificates in production environments
3. **Secure Environment Files**: Protect `.env` files and never commit them to version control
4. **Regular Updates**: Keep dependencies updated and monitor for security advisories
5. **Access Control**: Implement proper network access controls, especially on Raspberry Pi deployments
6. **File Permissions**: Ensure proper file permissions on deployed systems

### Scope

This security policy applies to:

- The main application code
- Dependencies and third-party libraries
- Deployment scripts and configurations
- Documentation that may contain security-relevant information

### Recognition

We appreciate security researchers and will acknowledge your contribution (with your permission) when a vulnerability is responsibly disclosed and fixed.

## Contact

For any security-related questions or concerns, please contact:

**Loïc Muhirwa**  
Email: loic.muhirwa@gmail.com  
GitHub: [@justmeloic](https://github.com/justmeloic)
