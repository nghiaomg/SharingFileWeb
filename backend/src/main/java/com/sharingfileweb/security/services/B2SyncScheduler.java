package com.sharingfileweb.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.backblaze.b2.client.structures.B2FileVersion;
import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.services.B2StorageService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class B2SyncScheduler {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private B2StorageService b2StorageService;

    private void logMissingFileError(String errorMessage) {
        try {
            File logsDir = new File("logs");
            if (!logsDir.exists()) {
                logsDir.mkdirs();
            }
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            File logFile = new File(logsDir, "b2-sync-error-" + currentDate + ".log");
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            try (FileWriter writer = new FileWriter(logFile, true)) {
                writer.write("[" + timestamp + "] " + errorMessage + "\n");
            }
        } catch (IOException e) {
            System.err.println("Không thể ghi log ra file: " + e.getMessage());
        }
    }

    // Chạy lúc 3 giờ sáng mỗi ngày (Sau TrashCleanupScheduler)
    @Scheduled(cron = "0 0 3 * * ?")
    public void syncB2WithDatabase() {
        System.out.println("[B2-SYNC] Bắt đầu tiến trình kiểm tra đồng bộ giữa B2 và MongoDB...");

        // 1. Lấy tất cả thông tin các file trong DB có mang b2FileId
        List<StorageFile> allDbFiles = fileRepository.findByB2FileIdIsNotNull();
        
        // Tạo Set chứa toàn bộ ID từ DB để lookup O(1)
        Set<String> dbFileIds = allDbFiles.stream()
                .map(StorageFile::getB2FileId)
                .collect(Collectors.toSet());

        // Tập hợp này dùng để chứa danh sách Id thực tế trên Cloud B2 
        Set<String> b2FileIdsOnCloud = new HashSet<>();

        // Ngưỡng thời gian: Lấy hiện tại trừ đi 2 tiếng
        long safeUploadThresholdMillis = Instant.now().minus(2, ChronoUnit.HOURS).toEpochMilli();

        int deletedOrphans = 0;
        int missingFilesCount = 0;

        try {
            // 2. Duyệt Iterator danh sách thực trên Backblaze B2 (Case 1: Orphan Files)
            Iterable<B2FileVersion> b2Files = b2StorageService.listAllFiles();
            for (B2FileVersion b2File : b2Files) {
                String cloudFileId = b2File.getFileId();
                b2FileIdsOnCloud.add(cloudFileId);

                // Nếu file trên Cloud KHÔNG nằm trong biến lookup của Database
                if (!dbFileIds.contains(cloudFileId)) {
                    // Cần kiểm tra thời gian upload để tránh xóa nhầm file đang upload
                    if (b2File.getUploadTimestamp() < safeUploadThresholdMillis) {
                        System.out.println("[B2-SYNC-ORPHAN] Phát hiện rác ẩn trên B2 (Orphan): " 
                                + b2File.getFileName() + " (Thực hiện xóa vĩnh viễn...)");
                        
                        b2StorageService.deleteFile(cloudFileId, b2File.getFileName());
                        deletedOrphans++;
                    } else {
                        System.out.println("[B2-SYNC-IGNORE] Bỏ qua file khả nghi (hoặc đang upload) quá mới: " 
                                + b2File.getFileName());
                    }
                }
            }

            // 3. Quét kiểm tra ngược lại: DB record bị mất file B2 (Case 2: Missing B2 Data)
            for (StorageFile dbFile : allDbFiles) {
                // Chúng ta chỉ quan tâm những record chưa bị xóa
                if (!dbFile.isDeleted()) {
                    if (!b2FileIdsOnCloud.contains(dbFile.getB2FileId())) {
                        String errMsg = "[B2-SYNC-ERROR] NGUY HIỂM: Lỗi file chưa được upload lên blackBlaze B2. File ID " + dbFile.getId() +
                                " (B2_ID: " + dbFile.getB2FileId() + ", Name: " + dbFile.getName() +
                                ") có trong DB nhưng bị MẤT trên Cloud B2!";
                        System.err.println(errMsg);
                        logMissingFileError(errMsg);
                        missingFilesCount++;
                    }
                }
            }

            System.out.println("[B2-SYNC] Đã hoàn thành hệ thống kiểm tra quét ban đêm.");
            System.out.println("[B2-SYNC]  +) Đã xóa " + deletedOrphans + " file rác (Orphans) kẹt lại trên B2.");
            if (missingFilesCount > 0) {
                System.err.println("[B2-SYNC]  +) BÁO ĐỘNG: Đã phát hiện " + missingFilesCount + " file bị mất/hỏng trên B2.");
            } else {
                System.out.println("[B2-SYNC]  +) Không phát hiện file nào bị mất trên B2.");
            }

        } catch (Exception e) {
            System.err.println("[B2-SYNC-CRASH] Tiến trình Scheduled Job gặp lỗi nghiêm trọng: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
