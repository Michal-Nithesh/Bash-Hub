# Spring Boot CORS Configuration

Since Postman works but your React frontend doesn't, this is a classic CORS (Cross-Origin Resource Sharing) issue. Here's how to fix it in your Spring Boot application:

## Option 1: Add @CrossOrigin Annotation to Controllers

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}) // React dev server ports
public class ChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        
        // Your chat logic here
        String response = processMessage(message);
        
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("response", response);
        
        return ResponseEntity.ok(responseMap);
    }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FileAnalysisController {
    
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeFile(@RequestParam("file") MultipartFile file) {
        try {
            // Your file analysis logic here
            String analysis = analyzeUploadedFile(file);
            
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

## Option 2: Global CORS Configuration (Recommended)

Create a configuration class:

```java
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
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Allow origins (React development servers)
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all HTTP methods
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

## Option 3: WebMvcConfigurer Implementation

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000", 
                    "http://localhost:5173",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // 1 hour
    }
}
```

## Quick Test

After adding CORS configuration to your Spring Boot app:

1. Restart your Spring Boot application on port 9090
2. Test in your browser console:
```javascript
fetch('http://localhost:9090/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({message: 'test'})
})
.then(response => response.json())
.then(data => console.log(data));
```

## Environment Variable Setup

For Gemini AI fallback, create a `.env` file in your React project root:

```env
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Troubleshooting

If you're still having issues:

1. **Check Spring Boot Logs**: Look for CORS-related errors
2. **Verify Port**: Ensure Spring Boot is running on 9090
3. **Test Endpoints**: Use browser dev tools Network tab to see actual requests
4. **Restart Both**: Restart both React and Spring Boot after changes

## Common CORS Error Messages

- `Access to fetch at 'http://localhost:9090/api/chat' from origin 'http://localhost:3000' has been blocked by CORS policy`
- `net::ERR_FAILED` - Usually indicates server not running or CORS blocking

The CORS configuration will solve the `net::ERR_FAILED` error you're seeing!