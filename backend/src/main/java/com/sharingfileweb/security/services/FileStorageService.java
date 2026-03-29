package com.sharingfileweb.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import com.sharingfileweb.services.B2StorageService;

import org.apache.tika.Tika;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;

@Service
public class FileStorageService {

  private final String UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize().toString();
  private final String TEMP_DIR = UPLOAD_DIR + File.separator + "temp";

  @Autowired
  private B2StorageService b2StorageService;

  public FileStorageService() {
    createDirectory(TEMP_DIR);
  }

  private void createDirectory(String path) {
    try {
      Files.createDirectories(Paths.get(path));
    } catch (IOException e) {
      throw new RuntimeException("Could not create directory: " + path, e);
    }
  }

  // ─── Chunk Management (giữ nguyên trên temp disk) ─────────────────────────

  public void storeChunk(String uploadId, int chunkIndex, MultipartFile file) throws IOException {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Cannot store empty chunk.");
    }
    
    String chunkDirPath = TEMP_DIR + File.separator + uploadId;
    createDirectory(chunkDirPath);

    Path chunkPath = Paths.get(chunkDirPath, String.valueOf(chunkIndex));
    file.transferTo(chunkPath.toFile());
  }

  public List<Integer> getUploadedChunks(String uploadId) {
    String chunkDirPath = TEMP_DIR + File.separator + uploadId;
    Path chunkDir = Paths.get(chunkDirPath);
    List<Integer> uploadedChunks = new ArrayList<>();

    if (Files.exists(chunkDir)) {
      try (Stream<Path> paths = Files.list(chunkDir)) {
          paths.filter(Files::isRegularFile)
               .forEach(path -> {
                   try {
                       uploadedChunks.add(Integer.parseInt(path.getFileName().toString()));
                   } catch (NumberFormatException e) {
                       // Ignore files that are not numbers
                   }
               });
      } catch (IOException e) {
          System.err.println("Error reading chunk directory: " + e.getMessage());
      }
    }
    return uploadedChunks;
  }

  // ─── Merge + Upload to B2 ─────────────────────────────────────────────────

  /**
   * Kết quả merge + upload B2.
   * Thay thế MergedFileResult cũ — giờ chứa thông tin B2 thay vì disk path.
   */
  public static class B2MergedResult {
      private String b2FileId;
      private String b2FileName;
      private String realMimeType;
      private long finalSize;
      
      public B2MergedResult(String b2FileId, String b2FileName, String realMimeType, long finalSize) {
          this.b2FileId = b2FileId;
          this.b2FileName = b2FileName;
          this.realMimeType = realMimeType;
          this.finalSize = finalSize;
      }
      public String getB2FileId() { return b2FileId; }
      public String getB2FileName() { return b2FileName; }
      public String getRealMimeType() { return realMimeType; }
      public long getFinalSize() { return finalSize; }
  }

  /**
   * Merge chunks → validate (Tika + image re-encode) → upload B2 → cleanup local.
   * 
   * Flow: temp chunks → merged file → Tika detect → image re-encode nếu cần → upload B2 → xóa file local
   */
  public B2MergedResult mergeChunksAndUploadB2(String uploadId, String fileName, int totalChunks, String ownerId) throws IOException {
    String chunkDirPath = TEMP_DIR + File.separator + uploadId;
    Path chunkDir = Paths.get(chunkDirPath);

    if (totalChunks > 0 && !Files.exists(chunkDir)) {
      throw new RuntimeException("Temporary chunk directory not found.");
    }

    // Tạo thư mục temp tạm để merge (sẽ xóa sau khi upload B2)
    String tempMergeDir = TEMP_DIR + File.separator + "merge_" + uploadId;
    createDirectory(tempMergeDir);

    String extension = "";
    int extIndex = fileName.lastIndexOf('.');
    if (extIndex > 0) {
        extension = fileName.substring(extIndex);
    }
    String uniqueFileName = UUID.randomUUID().toString() + extension;
    Path mergedFilePath = Paths.get(tempMergeDir, uniqueFileName);

    if (totalChunks == 0) {
        Files.createFile(mergedFilePath);
        // Upload empty file to B2
        String b2FileName = ownerId + "/" + uniqueFileName;
        B2StorageService.B2UploadResult result = b2StorageService.uploadFile(mergedFilePath, b2FileName, "application/octet-stream");
        // Cleanup local
        deleteDirectoryRecursively(Paths.get(tempMergeDir));
        return new B2MergedResult(result.getB2FileId(), result.getB2FileName(), "application/octet-stream", 0);
    }

    // Merge chunks vào file tạm
    try (OutputStream outputStream = new BufferedOutputStream(new FileOutputStream(mergedFilePath.toFile(), true))) {
      for (int i = 0; i < totalChunks; i++) {
        Path chunkPath = Paths.get(chunkDirPath, String.valueOf(i));
        if (!Files.exists(chunkPath)) {
            throw new RuntimeException("Missing chunk index: " + i);
        }
        Files.copy(chunkPath, outputStream);
      }
    }

    // Cleanup chunk directory
    deleteDirectoryRecursively(chunkDir);

    // Lớp 1: Đọc Magic Bytes bằng Tika
    Tika tika = new Tika();
    String realMimeType = tika.detect(mergedFilePath.toFile());

    // Lớp 4: Xóa metadata/EXIF ảnh an toàn bằng ImageIO re-encode
    if (realMimeType != null && (realMimeType.startsWith("image/jpeg") || realMimeType.startsWith("image/png"))) {
        try {
            BufferedImage originalImage = ImageIO.read(mergedFilePath.toFile());
            if (originalImage != null) {
                BufferedImage newImage = new BufferedImage(
                        originalImage.getWidth(),
                        originalImage.getHeight(),
                        BufferedImage.TYPE_INT_RGB);
                if (realMimeType.equals("image/png")) {
                    newImage = new BufferedImage(
                        originalImage.getWidth(),
                        originalImage.getHeight(),
                        BufferedImage.TYPE_INT_ARGB);
                }
                Graphics2D g = newImage.createGraphics();
                g.drawImage(originalImage, 0, 0, null);
                g.dispose();

                String formatName = realMimeType.equals("image/png") ? "png" : "jpeg";
                ImageIO.write(newImage, formatName, mergedFilePath.toFile());
            } else {
                throw new RuntimeException("Image is invalid or corrupted.");
            }
        } catch (Exception e) {
            System.err.println("Could not re-encode image: " + e.getMessage());
            // Cleanup temp merge dir trước khi throw
            deleteDirectoryRecursively(Paths.get(tempMergeDir));
            throw new RuntimeException("Upload failed due to invalid image file content.");
        }
    }

    long finalSize = Files.size(mergedFilePath);

    // Upload lên B2
    String b2FileName = ownerId + "/" + uniqueFileName;
    B2StorageService.B2UploadResult b2Result;

    try {
        // File > 100MB dùng Large File API
        if (finalSize > 100 * 1024 * 1024) {
            b2Result = b2StorageService.uploadLargeFile(mergedFilePath, b2FileName, realMimeType);
        } else {
            b2Result = b2StorageService.uploadFile(mergedFilePath, b2FileName, realMimeType);
        }
    } finally {
        // QUAN TRỌNG: Luôn xóa file local sau khi upload (dù thành công hay thất bại)
        try {
            deleteDirectoryRecursively(Paths.get(tempMergeDir));
        } catch (IOException cleanupEx) {
            System.err.println("[Cleanup] Failed to delete temp merge dir: " + cleanupEx.getMessage());
        }
    }

    return new B2MergedResult(b2Result.getB2FileId(), b2Result.getB2FileName(), realMimeType, finalSize);
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  public void deleteDirectoryRecursively(Path path) throws IOException {
    if (Files.exists(path)) {
      try (Stream<Path> walk = Files.walk(path)) {
        walk.sorted(Comparator.reverseOrder())
            .map(Path::toFile)
            .forEach(File::delete);
      }
    }
  }

  /**
   * Quét tất cả sub-folder trong uploads/temp/ và xóa những folder
   * có lastModifiedTime không được cập nhật trong >= thresholdHours giờ.
   */
  public int cleanupStaleTempFolders(long thresholdHours) {
    Path tempDir = Paths.get(TEMP_DIR);
    if (!Files.exists(tempDir)) return 0;

    Instant cutoff = Instant.now().minus(thresholdHours, ChronoUnit.HOURS);
    int deleted = 0;

    try (Stream<Path> entries = Files.list(tempDir)) {
      List<Path> staleFolders = entries
          .filter(Files::isDirectory)
          .filter(folder -> {
            try {
              FileTime lastModified = Files.getLastModifiedTime(folder);
              return lastModified.toInstant().isBefore(cutoff);
            } catch (IOException e) {
              System.err.println("Không đọc được lastModifiedTime của: " + folder + " — " + e.getMessage());
              return false;
            }
          })
          .collect(java.util.stream.Collectors.toList());

      for (Path folder : staleFolders) {
        try {
          deleteDirectoryRecursively(folder);
          System.out.println("[TempCleanup] Đã xóa thư mục temp stale: " + folder.getFileName());
          deleted++;
        } catch (IOException e) {
          System.err.println("[TempCleanup] Không thể xóa: " + folder + " — " + e.getMessage());
        }
      }
    } catch (IOException e) {
      System.err.println("[TempCleanup] Lỗi khi quét thư mục temp: " + e.getMessage());
    }

    return deleted;
  }
}
