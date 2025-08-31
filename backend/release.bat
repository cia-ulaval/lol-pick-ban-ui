@echo off
set "files=PickBanUIBackend.exe config.json"
set "releaseDir=release"

if not exist "%releaseDir%" (
    mkdir "%releaseDir%"
    echo Created directory: %releaseDir%
)

for %%f in (%files%) do (
    if exist "%%f" (
        copy /y "%%f" "%releaseDir%"
        echo Copied %%f to %releaseDir%
    ) else (
        echo WARNING: File %%f not found. Skipping.
    )
)

powershell -Command "Compress-Archive -Path '%releaseDir%\*' -DestinationPath '%releaseDir%\PickBanUIBackend.zip' -Force"
if exist "%releaseDir%\PickBanUIBackend.zip" (
    echo Created ZIP archive: PickBanUIBackend.zip
) else (
    echo ERROR: Failed to create PickBanUIBackend.zip
)

echo Process completed.
