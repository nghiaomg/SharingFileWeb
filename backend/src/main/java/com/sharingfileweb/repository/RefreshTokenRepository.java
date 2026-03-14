package com.sharingfileweb.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.RefreshToken;
import com.sharingfileweb.models.User;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
  Optional<RefreshToken> findByToken(String token);

  int deleteByUser(User user);
}
