package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.StorageFile;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends MongoRepository<StorageFile, String> {
  List<StorageFile> findByOwnerIdAndFolderId(String ownerId, String folderId);
  List<StorageFile> findByOwnerId(String ownerId);
  Optional<StorageFile> findByIdAndOwnerId(String id, String ownerId);
  Boolean existsByNameAndOwnerIdAndFolderId(String name, String ownerId, String folderId);
  void deleteByOwnerIdAndFolderId(String ownerId, String folderId); // To delete files when a folder is deleted
}
