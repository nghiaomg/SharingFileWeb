package com.sharingfileweb.config;

import com.sharingfileweb.models.SubscriptionPlan;
import com.sharingfileweb.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) throws Exception {
        if (subscriptionPlanRepository.count() == 0) {
            System.out.println("No Subscription Plans found. Seeding default packages...");

            // 1. Gói Cơ Bản (BASIC)
            SubscriptionPlan basicPlan = new SubscriptionPlan();
            basicPlan.setName("BASIC");
            basicPlan.setDisplayName("Gói Cơ Bản");
            basicPlan.setMaxStorage(5L * 1024 * 1024 * 1024); // 5 GB
            basicPlan.setMaxFileSize(100L * 1024 * 1024); // 100 MB
            basicPlan.setPrice(0L);
            basicPlan.setDescription("Dung lượng lưu trữ 5 GB\nUpload tối đa 100 MB / tệp\nSử dụng tính năng cơ bản\nHỗ trợ qua email");
            basicPlan.setDurationDays(0); // Vĩnh viễn / Không hết hạn
            basicPlan.setSortOrder(1);
            basicPlan.setActive(true);

            // 2. FileFlow Pro (PRO)
            SubscriptionPlan proPlan = new SubscriptionPlan();
            proPlan.setName("PRO");
            proPlan.setDisplayName("FileFlow Pro");
            proPlan.setMaxStorage(2048L * 1024 * 1024 * 1024); // 2.0 TB
            proPlan.setMaxFileSize(-1L); // Không giới hạn
            proPlan.setPrice(9000L);
            proPlan.setDescription("Lưu trữ không giới hạn 2.0 TB\nUpload không giới hạn kích thước tệp\nBăng thông tải không giới hạn\nMã hóa bảo vệ tệp cao cấp (AES-256)\nHỗ trợ ưu tiên 24/7\nKhôi phục tệp đã xóa trong 30 ngày");
            proPlan.setDurationDays(30); // Theo tháng
            proPlan.setSortOrder(2);
            proPlan.setActive(true);

            subscriptionPlanRepository.saveAll(Arrays.asList(basicPlan, proPlan));

            System.out.println("Default Subscription Packages seeded successfully.");
        }
    }
}
