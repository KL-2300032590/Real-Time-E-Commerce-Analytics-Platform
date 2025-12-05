package com.example.analytics.service;
import com.example.analytics.repo.EventTypeCountView;


import com.example.analytics.dto.MetricsSummaryResponse;
import com.example.analytics.repo.UserEventRecordRepository;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.example.analytics.model.EventRecord;

import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final UserEventRecordRepository repository;

    public AnalyticsService(UserEventRecordRepository repository) {
        this.repository = repository;
    }

    public MetricsSummaryResponse getSummaryMetrics() {
        long totalEvents = repository.count();
        long totalPurchases = repository.countByEventType("PURCHASE");
        Double totalRevenue = repository.getTotalRevenue();
        Long uniqueUsers = repository.getUniqueUsers();

        return new MetricsSummaryResponse(
                totalEvents,
                totalPurchases,
                totalRevenue != null ? totalRevenue : 0.0,
                uniqueUsers != null ? uniqueUsers : 0L
        );
    }
    
    public double getRevenueLastHour() {
        long cutoff = System.currentTimeMillis() - (60 * 60 * 1000); // last 60 mins
        Double result = repository.getRevenueSince(cutoff);
        return result != null ? result : 0.0;
    }
    
    public Map<String, Long> getEventTypeBreakdown() {
        List<EventTypeCountView> rows = repository.getEventCountsByType();
        Map<String, Long> result = new HashMap<>();

        for (EventTypeCountView row : rows) {
            result.put(row.getEventType(), row.getCount());
        }

        return result;
    }
   public List<Map<String, Object>> getRevenueTimeline() {

    long now = System.currentTimeMillis();
    long cutoff = now - (60 * 60 * 1000); // last 1 hour

    List<EventRecord> purchases =
            repository.findPurchasesSince(cutoff);

    // Prepare 12 buckets of 5 minutes each
    int bucketCount = 12;
    long bucketSize = 5 * 60 * 1000; // 5 minutes

    List<Map<String, Object>> result = new ArrayList<>();

    for (int i = 0; i < bucketCount; i++) {
        long bucketStart = cutoff + (i * bucketSize);
        long bucketEnd = bucketStart + bucketSize;

        // --- FIX: Change type to double and use mapToDouble to preserve precision ---
        double revenue = purchases.stream()
                .filter(e -> e.getTimestamp() >= bucketStart && e.getTimestamp() < bucketEnd)
                .mapToDouble(e -> {
                    // Safe access: return 0.0 if price is null
                    return e.getPrice() != null ? e.getPrice() : 0.0;
                })
                .sum();
        // --------------------------------------------------------------------------

        result.add(Map.of(
                "time", new java.text.SimpleDateFormat("HH:mm")
                        .format(new java.util.Date(bucketStart)),
                "revenue", revenue 
        ));
    }

    return result;
}

}
