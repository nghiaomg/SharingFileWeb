@echo off
TITLE SharingFileWeb - Backend
echo =======================================================
echo          Bat dau chay Backend (Spring Boot)
echo =======================================================
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if "%%A" neq "" if "%%B" neq "" (
            set "%%A=%%B"
        )
    )
)
mvn spring-boot:run
pause
