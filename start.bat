@echo off
TITLE SharingFileWeb - Khởi động ứng dụng
echo =======================================================
echo          Bat dau chay SharingFileWeb
echo =======================================================

:: Mở Backend (Spring Boot)
echo Dang khoi dong Backend o Cong 8080...
start "SharingFileWeb - Backend" cmd /k "cd backend && mvn spring-boot:run"

:: Mở Frontend (Next.js)
echo Dang khoi dong Frontend o Cong 3000...
start "SharingFileWeb - Frontend" cmd /k "cd frontend && npm run dev"

echo =======================================================
echo Hai cua so Terminal da duoc mo de chay ung dung.
echo Bam phim bat ky de dong cua so nay...
echo =======================================================
pause > nul
