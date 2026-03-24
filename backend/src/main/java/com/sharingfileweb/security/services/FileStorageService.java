package com.sharingfileweb.security.services;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import com.sharingfileweb.models.StorageFile;

@Service
public class FileStorageService {

  private final String UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize().toString();
  private final String TEMP_DIR = UPLOAD_DIR + File.separator + "temp";
  private final String FILES_DIR = UPLOAD_DIR + File.separator + "files";

  public FileStorageService() {
    createDirectory(TEMP_DIR);
    createDirectory(FILES_DIR);
  }

  private void createDirectory(String path) {
    try {
      Files.createDirectories(Paths.get(path));
    } catch (IOException e) {
      throw new RuntimeException("Could not create directory: " + path, e);
    }
  }

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

  public String mergeChunks(String uploadId, String fileName, int totalChunks, String ownerId) throws IOException {
    String chunkDirPath = TEMP_DIR + File.separator + uploadId;
    Path chunkDir = Paths.get(chunkDirPath);

    if (totalChunks > 0 && !Files.exists(chunkDir)) {
      throw new RuntimeException("Temporary chunk directory not found.");
    }

    String ownerDirPath = FILES_DIR + File.separator + ownerId;
    createDirectory(ownerDirPath);

    String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
    Path mergedFilePath = Paths.get(ownerDirPath, uniqueFileName);

    if (totalChunks == 0) {
        Files.createFile(mergedFilePath);
        return mergedFilePath.toString();
    }

    try (OutputStream outputStream = new BufferedOutputStream(new FileOutputStream(mergedFilePath.toFile(), true))) {
      for (int i = 0; i < totalChunks; i++) {
        Path chunkPath = Paths.get(chunkDirPath, String.valueOf(i));
        if (!Files.exists(chunkPath)) {
            throw new RuntimeException("Missing chunk index: " + i);
        }
        Files.copy(chunkPath, outputStream);
      }
    }

    // Clean up temporary chunks
    deleteDirectoryRecursively(chunkDir);

    return mergedFilePath.toString();
  }

  public Resource loadFileAsResource(StorageFile file) throws Exception {
    try {
      Path filePath = Paths.get(file.getStoredPath()).normalize();
      Resource resource = new UrlResource(filePath.toUri());
      if (resource.exists() && resource.isReadable()) {
        return resource;
      } else {
        throw new FileNotFoundException("File not found or not readable " + file.getName());
      }
    } catch (Exception ex) {
      throw new Exception("Could not find file " + file.getName(), ex);
    }
  }

  public void deleteFilePhysical(String storedPath) {
    try {
      Path path = Paths.get(storedPath);
      Files.deleteIfExists(path);
    } catch (IOException e) {
      System.err.println("Could not delete physical file: " + storedPath);
    }
  }

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
   *
   * @param thresholdHours số giờ tối thiểu không hoạt động để bị coi là "stale"
   * @return số lượng folder đã xóa
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
