#!/bin/bash

set -e  # nếu có lỗi thì dừng luôn (khuyến nghị)

echo "<3 Docker dang dung..."
docker compose down

echo "<3 Git dang pull code..."
git pull origin main

echo "<3 Docker dang build..."
docker compose build --no-cache

echo "<3 Docker dang chay..."
docker compose up -d

echo "<3 Hoan tat deploy!"