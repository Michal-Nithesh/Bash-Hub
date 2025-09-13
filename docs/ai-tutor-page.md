# AI Tutor Page

A dedicated AI tutoring interface that provides students with personalized learning support and academic assistance.

## Features

### 🎓 Comprehensive Academic Support
- **Mathematics**: Algebra, calculus, statistics, problem-solving
- **Programming**: Code debugging, algorithm explanation, data structures
- **Science**: Physics, chemistry, biology concepts
- **Writing**: Essay structure, grammar, thesis development
- **Literature**: Text analysis, themes, character development
- **General Problem Solving**: Step-by-step guidance

### 📊 Learning Analytics
- **Study Sessions**: Track learning time and progress
- **Question History**: Monitor questions asked and topics covered
- **Subject Preferences**: Identify favorite learning areas
- **Progress Tracking**: Weekly learning goals and achievements
- **Study Streaks**: Maintain consistent learning habits

### 🤖 AI Chatbot Integration
- **Real-time Chat**: Instant responses to academic questions
- **File Analysis**: Upload homework, notes, or problems for review
- **Quick Start Prompts**: Pre-defined questions to get started quickly
- **Personalized Explanations**: Adaptive responses based on learning level
- **Multi-modal Support**: Text and file-based interactions

### 🎯 Quick Start Features
- **Subject Categories**: Organized by academic disciplines
- **Example Prompts**: Ready-to-use questions for each subject
- **Learning Tips**: Best practices for effective AI tutoring
- **Session History**: Review past learning activities

## Usage Guide

### Getting Started
1. Navigate to `/ai-tutor` or click "AI Tutor" in the navigation
2. The AI chatbot opens automatically on the tutor page
3. Choose from quick start prompts or ask your own questions
4. Upload files for analysis and feedback

### Asking Effective Questions
- **Be Specific**: "Explain quadratic equations" vs "Help with math"
- **Provide Context**: Include what you've already tried
- **Ask Follow-ups**: Dive deeper into concepts you don't understand
- **Request Examples**: Ask for practice problems or examples

### File Upload Support
- **Homework**: Get help with assignments and problem sets
- **Notes**: Review and expand on class notes
- **Code**: Debug programming assignments
- **Essays**: Receive writing feedback and suggestions

### Learning Tips
- **Daily Practice**: Use the tutor regularly for consistent progress
- **Track Progress**: Monitor your learning statistics and streaks
- **Explore Subjects**: Try different academic areas to broaden knowledge
- **Ask Questions**: No question is too basic or advanced

## Technical Implementation

### Components
- `AiTutor.tsx`: Main page component with learning dashboard
- `Chatbot.tsx`: Integrated AI chat interface
- `chatbotService.ts`: Backend API communication

### Backend Integration
- **Spring Boot API**: Primary tutoring backend
- **Gemini AI**: Fallback AI service
- **File Analysis**: Document processing and feedback

### Routing
- **URL**: `/ai-tutor`
- **Protection**: Requires user authentication
- **Navigation**: Accessible from main navbar

### State Management
- Learning statistics and session history
- Chatbot visibility and interaction state
- Real-time connection status monitoring

## Customization

### Adding New Subjects
To add new subject categories, update the `tutorFeatures` array in `AiTutor.tsx`:

```typescript
{
  icon: <YourIcon className="w-6 h-6" />,
  title: "New Subject",
  description: "Subject description",
  category: "Category",
  examples: ["Example question 1", "Example question 2"]
}
```

### Modifying Quick Start Prompts
Update the `quickStartPrompts` array with new pre-defined questions:

```typescript
const quickStartPrompts = [
  "Your new prompt here",
  // ... existing prompts
];
```

### Styling Customization
The page uses Tailwind CSS with:
- **Blue/Purple Gradient Theme**: Primary branding colors
- **Card-based Layout**: Organized content sections
- **Responsive Design**: Mobile and desktop compatibility
- **Dark Mode Support**: Automatic theme switching

## Future Enhancements

### Planned Features
- **Voice Interaction**: Speech-to-text and text-to-speech
- **Learning Paths**: Structured course progressions
- **Collaborative Study**: Multi-user study sessions
- **Offline Mode**: Cached responses for limited connectivity
- **Advanced Analytics**: Detailed learning insights
- **Custom AI Models**: Subject-specific AI tutors

### Integration Opportunities
- **Calendar Integration**: Schedule study sessions
- **Grade Tracking**: Monitor academic performance
- **Resource Library**: Curated learning materials
- **Peer Connections**: Connect with study partners
- **Teacher Dashboard**: Instructor insights and feedback

## Accessibility

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Tab navigation through chatbot interface
- Enter key for sending messages

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Alt text for icons and images

### Visual Accessibility
- High contrast color schemes
- Scalable font sizes
- Clear visual hierarchy
- Dark mode support for eye strain reduction