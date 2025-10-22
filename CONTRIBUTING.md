# Contributing to Mango Cannabis Menu Builder

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [GitHub Flow](https://guides.github.com/introduction/flow/index.html)

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Setup
```bash
# Clone your fork
git clone https://github.com/your-username/menu-builder.git
cd menu-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Run Electron app
npm run electron-dev
```

### Building
```bash
# Build for production
npm run build

# Package Electron app for Windows
npm run dist

# Package Electron app for macOS (DMG + ZIP outputs)
npm run dist:mac
```

## Code Style

We use TypeScript and follow these conventions:

- **File naming**: Use PascalCase for components (`MenuTable.tsx`), camelCase for utilities
- **Component structure**: Functional components with hooks
- **Type safety**: Always use TypeScript types, avoid `any`
- **Imports**: Group imports (React, libraries, local components, types)
- **Comments**: Use JSDoc for functions, inline comments for complex logic

### Example Component Structure
```tsx
import React, { useState, useEffect } from 'react';
import { SomeLibrary } from 'some-library';
import { Button } from './common/Button';
import { MyComponentProps } from '../types';

/**
 * Component description
 */
export const MyComponent: React.FC<MyComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/mangocannabis/menu-builder/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/mangocannabis/menu-builder/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues to avoid duplicates
2. Clearly describe the feature and its use case
3. Consider the scope - is this a core feature or an enhancement?
4. Be open to discussion and iteration

## Testing

### Manual Testing
- Test all major workflows (import, export, editing)
- Test keyboard shortcuts
- Test different artboard sizes and formats
- Test with different strain data sets

### Automated Testing (Future)
We're working on adding automated tests. Areas that need coverage:
- CSV import/export functionality
- Strain sorting and filtering
- Image export quality
- UI component behavior

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Questions?

Don't hesitate to reach out:
- Email: [brad@mangocannabis.com](mailto:brad@mangocannabis.com)
- GitHub Issues: [Open an issue](https://github.com/mangocannabis/menu-builder/issues) 
