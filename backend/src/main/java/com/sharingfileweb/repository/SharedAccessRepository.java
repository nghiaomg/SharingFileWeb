package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.SharedAccess;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedAccessRepository extends MongoRepository<SharedAccess, String> {
    List<SharedAccess> findByRecipientEmailAndIsRevokedFalse(String recipientEmail);
    List<SharedAccess> findByOwnerIdAndIsRevokedFalse(String ownerId);
    List<SharedAccess> findByFileIdAndIsRevokedFalse(String fileId);
    Optional<SharedAccess> findByFileIdAndRecipientEmailAndIsRevokedFalse(String fileId, String recipientEmail);
    Optional<SharedAccess> findByIdAndOwnerId(String id, String ownerId);
}
