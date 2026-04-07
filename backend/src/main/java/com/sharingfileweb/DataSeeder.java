package com.sharingfileweb;

import com.sharingfileweb.models.ERole;
import com.sharingfileweb.models.Role;
import com.sharingfileweb.models.User;
import com.sharingfileweb.repository.RoleRepository;
import com.sharingfileweb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component("userDataSeeder")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
    }

    private void seedRoles() {
        if (!roleRepository.findByName(ERole.ROLE_USER).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_USER));
        }
        if (!roleRepository.findByName(ERole.ROLE_MODERATOR).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_MODERATOR));
        }
        if (!roleRepository.findByName(ERole.ROLE_ADMIN).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }
    }

    private void seedUsers() {
        // Seed Admin account
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@gmail.com", passwordEncoder.encode("123456"));
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Seeded Admin account: admin / 123456");
        }

        // Seed Normal User account
        if (!userRepository.existsByUsername("testuser")) {
            User user = new User("testuser", "testuser@gmail.com", passwordEncoder.encode("123456"));
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            user.setRoles(roles);
            userRepository.save(user);
            System.out.println("Seeded Normal User account: testuser / 123456");
        }
    }
}
