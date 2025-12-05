package com.example.analytics.service;

import com.example.analytics.config.KafkaProducerConfig;
import com.example.analytics.dto.UserEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserEventProducer {

    private final KafkaTemplate<String, UserEvent> kafkaTemplate;

    public UserEventProducer(KafkaTemplate<String, UserEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEvent(UserEvent event) {
        // You can choose key as userId or sessionId for partitioning
        String key = event.getUserId();
        kafkaTemplate.send(KafkaProducerConfig.USER_EVENTS_TOPIC, key, event);
    }
}
