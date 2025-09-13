# Quick Setup Guide for AI Chatbot

## 🚀 Current Status: Offline Mode Active

Your chatbot is now working in offline mode! It will provide basic responses while you set up the backend services.

## 📋 Setup Checklist

### 1. ✅ Spring Boot Backend Setup

**Step 1**: Add CORS Configuration to your Spring Boot application

Create this file in your Spring Boot project:

```java
// src/main/java/your/package/config/CorsConfig.java
package your.package.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

**Step 2**: Ensure your controllers are properly set up:

```java
@RestController
@RequestMapping("/api")
public class ChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        
        // Your AI logic here
        String response = "Echo: " + message; // Replace with your logic
        
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("response", response);
        
        return ResponseEntity.ok(responseMap);
    }
    
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyze(@RequestParam("file") MultipartFile file) {
        try {
            // Your file analysis logic
            String analysis = "Analysis of " + file.getOriginalFilename();
            
            Map<String, String> response = new HashMap<>();
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
```

**Step 3**: Start your Spring Boot application on port 9090

### 2. ✅ Gemini AI Setup (Optional but Recommended)

**Step 1**: Get a Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

**Step 2**: Create `.env` file in your React project root:

```env
REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
```

**Step 3**: Restart your React development server after creating the .env file

## 🧪 Testing

### Test Spring Boot Connection

Open browser console and run:

```javascript
fetch('http://localhost:9090/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({message: 'test'})
})
.then(response => response.json())
.then(data => console.log('Spring Boot response:', data))
.catch(error => console.error('Spring Boot error:', error));
```

### Test Chatbot

1. Go to your AI Tutor page
2. Type "hello" - you should get an offline response
3. After setting up backend, try asking questions

## 🔍 Connection Status Indicators

In the chatbot header, you'll see status indicators:
- 🔴 Red dot = Service unavailable
- 🟡 Yellow dot = Limited functionality  
- 🟢 Green dot = Fully connected

## 📝 Common Issues

### CORS Error
```
Access to fetch at 'http://localhost:9090/api/chat' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Add the CORS configuration shown above to your Spring Boot app

### API Key Error
```
Gemini API key not configured
```
**Solution**: Create .env file with REACT_APP_GEMINI_API_KEY and restart React server

### Connection Failed
```
net::ERR_FAILED
```
**Solution**: Ensure Spring Boot is running on port 9090

## 🎯 Priority Order

1. **First**: Just use offline mode to test the interface
2. **Second**: Set up Spring Boot backend for full functionality
3. **Third**: Add Gemini AI for enhanced responses

The chatbot will automatically upgrade from offline → Spring Boot → Gemini AI as services become available!

## 🆘 Need Help?

Try asking the chatbot itself! Even in offline mode, it can provide setup guidance:
- "help with setup"
- "how to fix errors"
- "connection problems"