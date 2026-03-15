package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.Folder;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends MongoRepository<Folder, String> {
  List<Folder> findByOwnerIdAndParentIdAndIsDeletedFalse(String ownerId, String parentId);
  List<Folder> findByOwnerIdAndIsDeletedFalse(String ownerId);
  Optional<Folder> findByIdAndOwnerIdAndIsDeletedFalse(String id, String ownerId);
  Boolean existsByNameAndOwnerIdAndParentIdAndIsDeletedFalse(String name, String ownerId, String parentId);
  void deleteByOwnerIdAndParentId(String ownerId, String parentId);

  // Custom queries cho thùng rác
  List<Folder> findByOwnerIdAndIsDeletedTrue(String ownerId);
  Optional<Folder> findByIdAndOwnerIdAndIsDeletedTrue(String id, String ownerId);

  // Lấy danh sách folder rác quá ngày để xóa tự động
  List<Folder> findByIsDeletedTrueAndDeletedAtBefore(java.time.Instant thresholdDate);
}
