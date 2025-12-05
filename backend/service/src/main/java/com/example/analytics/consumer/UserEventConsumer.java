package com.example.analytics.consumer;

import com.example.analytics.config.KafkaConsumerConfig;
import com.example.analytics.config.KafkaProducerConfig;
import com.example.analytics.dto.UserEvent;
import com.example.analytics.model.EventRecord;
import com.example.analytics.repo.UserEventRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(UserEventConsumer.class);

    private final UserEventRecordRepository repository;

    public UserEventConsumer(UserEventRecordRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(
            topics = KafkaProducerConfig.USER_EVENTS_TOPIC,
            groupId = KafkaConsumerConfig.CONSUMER_GROUP_ID,
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void handleUserEvent(UserEvent event) {
        log.info("📥 Consumed event from Kafka: {}", event);

        EventRecord record = new EventRecord(
                event.getEventType(),
                event.getUserId(),
                event.getSessionId(),
                event.getProductId(),
                event.getPrice(),
                event.getCurrency(),
                event.getTimestamp()
        );

        EventRecord saved = repository.save(record);
        log.info("💾 Saved event to DB with id={}", saved.getId());
    }
}
