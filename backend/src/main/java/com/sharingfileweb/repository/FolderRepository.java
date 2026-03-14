package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.Folder;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends MongoRepository<Folder, String> {
  List<Folder> findByOwnerIdAndParentId(String ownerId, String parentId);
  List<Folder> findByOwnerId(String ownerId);
  Optional<Folder> findByIdAndOwnerId(String id, String ownerId);
  Boolean existsByNameAndOwnerIdAndParentId(String name, String ownerId, String parentId);
  void deleteByOwnerIdAndParentId(String ownerId, String parentId);
}
