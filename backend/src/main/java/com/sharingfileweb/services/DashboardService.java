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

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.sharingfileweb.models.DailyMetric;
import com.sharingfileweb.payload.response.DashboardChartDTO;
import com.sharingfileweb.repository.DailyMetricRepository;

@Service
public class DashboardService {
    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private DailyMetricRepository dailyMetricRepository;

    public List<StorageCategoryDTO> getDashboardCategories(String ownerId, boolean isAdmin) {
        // 1. Fetch all files to aggregate categories
        List<StorageFile> allFiles = isAdmin 
            ? fileRepository.findByIsDeletedFalse()
            : fileRepository.findByOwnerIdAndIsDeletedFalse(ownerId);
        
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

    public List<RecentFileDTO> getDashboardRecentFiles(String ownerId, boolean isAdmin) {
        // 2. Fetch Recent Files (Limit 5)
        Pageable pageable = PageRequest.of(0, 5);
        List<StorageFile> recentFilesRaw = isAdmin
            ? fileRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable).getContent()
            : fileRepository.findByOwnerIdAndIsDeletedFalseOrderByCreatedAtDesc(ownerId, pageable).getContent();
        
        List<RecentFileDTO> recentFiles = recentFilesRaw.stream()
            .map(f -> new RecentFileDTO(f.getId(), f.getName(), f.getSize(), f.getType(), f.getCreatedAt()))
            .collect(Collectors.toList());

        return recentFiles;
    }

    public List<DashboardChartDTO> getDashboardCharts(int days, String ownerId, boolean isAdmin) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1); // e.g., if days=7, we want 7 days including today

        // Fetch metrics for the date range
        List<DailyMetric> metrics = dailyMetricRepository.findByDateBetweenOrderByDateAsc(startDate, endDate.plusDays(1));
        Map<LocalDate, Long> visitMap = metrics.stream()
                .collect(Collectors.toMap(DailyMetric::getDate, DailyMetric::getVisitCount));

        // Fetch files uploaded since startDate
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<StorageFile> recentFiles = isAdmin
                ? fileRepository.findByIsDeletedFalse()
                : fileRepository.findByOwnerIdAndIsDeletedFalse(ownerId);
        
        // Filter and group files by date
        Map<LocalDate, List<StorageFile>> filesByDate = recentFiles.stream()
                .filter(f -> f.getCreatedAt() != null && !f.getCreatedAt().isBefore(startInstant))
                .collect(Collectors.groupingBy(f -> LocalDate.ofInstant(f.getCreatedAt(), ZoneId.systemDefault())));

        List<DashboardChartDTO> results = new ArrayList<>();
        
        for (int i = 0; i < days; i++) {
            LocalDate iterDate = startDate.plusDays(i);
            long visits = visitMap.getOrDefault(iterDate, 0L);
            
            List<StorageFile> filesOnDay = filesByDate.getOrDefault(iterDate, new ArrayList<>());
            long uploadedFiles = filesOnDay.size();
            long uploadedSize = filesOnDay.stream().mapToLong(StorageFile::getSize).sum();
            
            // Format to simple string
            results.add(new DashboardChartDTO(iterDate.toString(), visits, uploadedFiles, uploadedSize));
        }

        return results;
    }
}
