package com.sharingfileweb.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.StorageFile;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends MongoRepository<StorageFile, String> {
  List<StorageFile> findByOwnerIdAndFolderIdAndIsDeletedFalse(String ownerId, String folderId);
  List<StorageFile> findByOwnerIdAndIsDeletedFalse(String ownerId);
  Optional<StorageFile> findByIdAndOwnerIdAndIsDeletedFalse(String id, String ownerId);
  Boolean existsByNameAndOwnerIdAndFolderIdAndIsDeletedFalse(String name, String ownerId, String folderId);
  void deleteByOwnerIdAndFolderId(String ownerId, String folderId); // To delete files when a folder is deleted

  // Custom queries cho thùng rác
  List<StorageFile> findByOwnerIdAndIsDeletedTrue(String ownerId);
  Optional<StorageFile> findByIdAndOwnerIdAndIsDeletedTrue(String id, String ownerId);
  
  // Lấy danh sách file rác quá ngày để xóa tự động
  List<StorageFile> findByIsDeletedTrueAndDeletedAtBefore(java.util.Date thresholdDate);

  // Tính tổng dung lượng (Aggregation) bao gồm cả file rác
  @Aggregation(pipeline = { "{ '$match': { 'ownerId' : ?0 } }", "{ '$group': { '_id': null, 'totalSize': { $sum: '$size' } } }" })
  Long sumSizeByOwnerId(String ownerId);
}
