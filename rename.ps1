# Run this in PowerShell from your project root: E:\Projects\your-career-match
# Right-click the folder → "Open in Terminal" → paste this

Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $updated = $content `
        -replace 'RoleMatch AI Career Suite', 'CareerLaunch AI' `
        -replace 'RoleMatch AI', 'CareerLaunch AI' `
        -replace 'RoleMatch', 'CareerLaunch' `
        -replace 'rolematch', 'careerlaunch'
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($_.Name)" -ForegroundColor Green
    }
}

# Also rename in index.html and package.json
@("index.html", "package.json") | ForEach-Object {
    if (Test-Path $_) {
        $content = Get-Content $_ -Raw -Encoding UTF8
        $updated = $content `
            -replace 'RoleMatch AI Career Suite', 'CareerLaunch AI' `
            -replace 'RoleMatch AI', 'CareerLaunch AI' `
            -replace 'RoleMatch', 'CareerLaunch' `
            -replace 'rolematch', 'careerlaunch'
        if ($content -ne $updated) {
            Set-Content $_ $updated -Encoding UTF8 -NoNewline
            Write-Host "Updated: $_" -ForegroundColor Green
        }
    }
}

Write-Host "`nDone! All RoleMatch references renamed to CareerLaunch." -ForegroundColor Cyan
