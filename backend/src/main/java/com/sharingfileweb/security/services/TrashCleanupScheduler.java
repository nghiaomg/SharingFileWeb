package com.sharingfileweb.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.Folder;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.FolderRepository;
import com.sharingfileweb.services.B2StorageService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
public class TrashCleanupScheduler {

    @Autowired
    FolderRepository folderRepository;

    @Autowired
    FileRepository fileRepository;

    @Autowired
    FileStorageService fileStorageService;

    @Autowired
    B2StorageService b2StorageService;

    // Chạy lúc 2 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldTrashItems() {
        System.out.println("Bắt đầu dọn dẹp các tệp/thư mục rác quá 30 ngày...");

        Instant thirtyDaysAgoInstant = Instant.now().minus(30, ChronoUnit.DAYS);
        Date thirtyDaysAgoDate = Date.from(thirtyDaysAgoInstant);

        // Tìm các File Deleted > 30 Days
        List<StorageFile> filesToDelete = fileRepository.findByIsDeletedTrueAndDeletedAtBefore(thirtyDaysAgoDate);
        for (StorageFile file : filesToDelete) {
            // Xóa trên B2
            if (file.getB2FileId() != null && !file.getB2FileId().isEmpty()) {
                b2StorageService.deleteFile(file.getB2FileId(), file.getB2FileName());
            }
            fileRepository.deleteById(file.getId());
            System.out.println("Đã tự động xóa vĩnh viễn tệp rác: " + file.getId());
        }

        // Tìm các Folder Deleted > 30 Days
        List<Folder> foldersToDelete = folderRepository.findByIsDeletedTrueAndDeletedAtBefore(thirtyDaysAgoInstant);
        for (Folder folder : foldersToDelete) {
             folderRepository.deleteById(folder.getId());
             System.out.println("Đã tự động xóa vĩnh viễn thư mục rác (cấp cha): " + folder.getId());
        }
    }

    // Chạy mỗi 6 tiếng (0h, 6h, 12h, 18h)
    @Scheduled(cron = "0 0 */6 * * ?")
    public void cleanupStaleTempUploads() {
        System.out.println("[TempCleanup] Bắt đầu quét và dọn dẹp thư mục temp upload không hoạt động >= 48 giờ...");
        int deleted = fileStorageService.cleanupStaleTempFolders(48);
        if (deleted == 0) {
            System.out.println("[TempCleanup] Không có thư mục temp stale nào cần dọn dẹp.");
        } else {
            System.out.println("[TempCleanup] Hoàn tất. Đã xóa " + deleted + " thư mục temp stale.");
        }
    }
}
