package com.example.analytics.repo;

import com.example.analytics.model.EventRecord; // Assume the Entity class is EventRecord
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserEventRecordRepository extends JpaRepository<EventRecord, Long> { // 🛠️ FIX 1a: Use actual Entity name here

    long countByEventType(String eventType);

    @Query("select coalesce(sum(e.price), 0) from com.example.analytics.model.EventRecord e where e.eventType = 'PURCHASE'")
    Double getTotalRevenue();

    @Query("select count(distinct e.userId) from com.example.analytics.model.EventRecord e")
    Long getUniqueUsers();

    @Query("select coalesce(sum(e.price), 0) " +
            "from com.example.analytics.model.EventRecord e " +
            "where e.eventType = 'PURCHASE' and e.timestamp >= :cutoff")
    Double getRevenueSince(@Param("cutoff") long cutoff);

    @Query("select e.eventType as eventType, count(e) as count " +
            "from com.example.analytics.model.EventRecord e " +
            "group by e.eventType")
    List<EventTypeCountView> getEventCountsByType(); 

    @Query("select e from UserEventRecord e where e.eventType='PURCHASE' and e.timestamp >= :cutoff") // <-- ERROR HERE
     List<EventRecord> findPurchasesSince(long cutoff);

}