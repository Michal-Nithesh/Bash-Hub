# AI Chatbot Integration

This project includes an AI-powered chatbot integrated into the Dashboard that connects to multiple backend services.

## Features

- **Real-time Chat**: Interactive conversation with AI assistant
- **File Analysis**: Upload and analyze files using your Spring Boot backend
- **Dual AI Support**: Primary Spring Boot backend with Gemini AI fallback
- **Connection Status**: Visual indicators for backend connectivity
- **Minimizable Interface**: Collapsible chatbot window
- **Error Handling**: Graceful fallbacks when services are unavailable

## Backend Endpoints

### Spring Boot API Endpoints

1. **Chat Endpoint**: `http://localhost:8080/api/chat`
   - Method: POST
   - Body: `{ "message": "your message here" }`
   - Response: `{ "response": "AI response" }`

2. **File Analysis Endpoint**: `http://localhost:8080/api/analyze`
   - Method: POST
   - Body: FormData with file
   - Response: `{ "analysis": "file analysis result" }`

### Gemini AI Integration

The chatbot also integrates with Google's Gemini AI as a fallback when the Spring Boot backend is unavailable.

**API Details**:
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Method: POST
- Headers: `X-goog-api-key: YOUR_GEMINI_API_KEY`

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Spring Boot Backend Setup

Ensure your Spring Boot application is running on `http://localhost:8080` with the following endpoints:

#### Chat Controller Example
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        
        // Your AI logic here
        String response = processMessage(message);
        
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("response", response);
        
        return ResponseEntity.ok(responseMap);
    }
}
```

#### File Analysis Controller Example
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FileAnalysisController {
    
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeFile(@RequestParam("file") MultipartFile file) {
        try {
            // Your file analysis logic here
            String analysis = analyzeFile(file);
            
            Map<String, String> response = new HashMap<>();
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File analysis failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
```

### 3. CORS Configuration

Add CORS configuration to your Spring Boot application:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Usage

### Starting the Chatbot

1. Navigate to the Dashboard page
2. Click the floating chat button (💬) in the bottom-right corner
3. The chatbot window will open

### Chat Features

- **Text Messages**: Type any question and press Enter
- **File Upload**: Click the upload button to analyze files
- **Minimize/Maximize**: Use the window controls to minimize or expand
- **Connection Status**: Green dots indicate active connections

### Supported File Types

- Text files (.txt)
- PDF documents (.pdf)
- Word documents (.doc, .docx)
- Images (.jpg, .jpeg, .png, .gif)

## Architecture

### Component Structure

```
src/
├── components/
│   └── Chatbot.tsx          # Main chatbot component
├── lib/
│   └── chatbotService.ts    # API service layer
└── pages/
    └── Dashboard.tsx        # Dashboard with chatbot integration
```

### Service Layer

The `chatbotService.ts` provides:
- Centralized API communication
- Error handling and fallbacks
- Health checking for backend services
- File analysis capabilities

### Error Handling

The chatbot handles various error scenarios:
- Spring Boot backend unavailable → Falls back to Gemini AI
- Gemini AI unavailable → Shows appropriate error message
- File analysis failure → Attempts text analysis with Gemini AI
- Network errors → User-friendly error messages

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure Spring Boot is running on port 8080
   - Check CORS configuration
   - Verify API endpoints are accessible

2. **Gemini AI Not Working**
   - Check your API key in the environment variables
   - Ensure you have proper API quotas
   - Verify network connectivity

3. **File Upload Issues**
   - Check file size limits (Spring Boot default: 1MB)
   - Ensure supported file types
   - Verify multipart configuration

### Development Tips

- Use browser dev tools to monitor network requests
- Check console logs for detailed error messages
- Test with small files first for file analysis
- Verify backend logs for server-side issues

## Future Enhancements

- Chat history persistence
- Voice message support
- Real-time typing indicators
- Custom AI model integration
- Advanced file analysis features
- Multi-language support