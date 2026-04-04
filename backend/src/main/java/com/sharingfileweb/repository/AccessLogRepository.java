package com.sharingfileweb.repository;

import com.sharingfileweb.entity.AccessLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AccessLogRepository extends MongoRepository<AccessLog, String> {

    List<AccessLog> findByFileId(String fileId);

    List<AccessLog> findByFileIdAndAccessedAtAfter(String fileId, Instant since);

    List<AccessLog> findByShareToken(String token);

    long countByAccessedByAndAccessType(String accessedBy, AccessLog.AccessType accessType);
}
