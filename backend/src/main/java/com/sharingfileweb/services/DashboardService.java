package com.sharingfileweb.services;

import com.sharingfileweb.models.StorageFile;
import com.sharingfileweb.payload.response.DashboardOverviewDTO;
import com.sharingfileweb.payload.response.RecentFileDTO;
import com.sharingfileweb.payload.response.StorageCategoryDTO;
import com.sharingfileweb.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    @Autowired
    private FileRepository fileRepository;

    public List<StorageCategoryDTO> getDashboardCategories(String ownerId) {
        // 1. Fetch all files to aggregate categories
        List<StorageFile> allFiles = fileRepository.findByOwnerIdAndIsDeletedFalse(ownerId);
        
        long countDocs = 0, sizeDocs = 0;
        long countImgs = 0, sizeImgs = 0;
        long countVids = 0, sizeVids = 0;
        long countOthers = 0, sizeOthers = 0;

        for (StorageFile file : allFiles) {
            String mime = file.getType();
            long size = file.getSize();
            if (mime != null) {
                if (mime.startsWith("image/")) {
                    countImgs++;
                    sizeImgs += size;
                } else if (mime.startsWith("video/")) {
                    countVids++;
                    sizeVids += size;
                } else if (mime.contains("pdf") || mime.contains("document") || mime.contains("msword") || mime.contains("excel") || mime.contains("powerpoint") || mime.contains("text/")) {
                    countDocs++;
                    sizeDocs += size;
                } else {
                    countOthers++;
                    sizeOthers += size;
                }
            } else {
                countOthers++;
                sizeOthers += size;
            }
        }

        List<StorageCategoryDTO> categories = new ArrayList<>();
        categories.add(new StorageCategoryDTO("Tài liệu", countDocs, sizeDocs));
        categories.add(new StorageCategoryDTO("Hình ảnh", countImgs, sizeImgs));
        categories.add(new StorageCategoryDTO("Video", countVids, sizeVids));
        categories.add(new StorageCategoryDTO("Khác", countOthers, sizeOthers));
        return categories;
    }

    public List<RecentFileDTO> getDashboardRecentFiles(String ownerId) {
        // 2. Fetch Recent Files (Limit 5)
        Pageable pageable = PageRequest.of(0, 5);
        List<StorageFile> recentFilesRaw = fileRepository.findByOwnerIdAndIsDeletedFalseOrderByCreatedAtDesc(ownerId, pageable).getContent();
        
        List<RecentFileDTO> recentFiles = recentFilesRaw.stream()
            .map(f -> new RecentFileDTO(f.getId(), f.getName(), f.getSize(), f.getType(), f.getCreatedAt()))
            .collect(Collectors.toList());

        return recentFiles;
    }
}
