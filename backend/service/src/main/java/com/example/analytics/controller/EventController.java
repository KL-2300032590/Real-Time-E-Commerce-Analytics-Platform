package com.example.analytics.controller;

import com.example.analytics.dto.UserEvent;
import com.example.analytics.service.UserEventProducer;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/events")
public class EventController {

    private final UserEventProducer userEventProducer;

    public EventController(UserEventProducer userEventProducer) {
        this.userEventProducer = userEventProducer;
    }

    @PostMapping
    public ResponseEntity<String> publishEvent(@Valid @RequestBody UserEvent event) {

        // basic guard: if PURCHASE, price must not be null
        if ("PURCHASE".equalsIgnoreCase(event.getEventType()) && event.getPrice() == null) {
            return ResponseEntity.badRequest().body("price is required for PURCHASE events");
        }

        userEventProducer.sendEvent(event);
        return new ResponseEntity<>("Event sent to Kafka", HttpStatus.ACCEPTED);
    }
}
