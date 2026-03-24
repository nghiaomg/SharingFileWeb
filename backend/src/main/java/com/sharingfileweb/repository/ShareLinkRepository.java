package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.ShareLink;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareLinkRepository extends MongoRepository<ShareLink, String> {
    Optional<ShareLink> findByToken(String token);
    List<ShareLink> findByFileIdAndOwnerIdAndIsRevokedFalse(String fileId, String ownerId);
    List<ShareLink> findByFileIdAndIsRevokedFalse(String fileId);
    Optional<ShareLink> findByIdAndOwnerId(String id, String ownerId);
}
