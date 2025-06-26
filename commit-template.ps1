# Function to determine commit type based on changed files
function Get-CommitType {
    $changedFiles = git diff --cached --name-only
    
    # Check for test files
    if ($changedFiles -match '\.test\.|\.spec\.') {
        return "test"
    }
    
    # Check for documentation
    if ($changedFiles -match '\.md$|docs/') {
        return "doc"
    }
    
    # Check for style changes
    if ($changedFiles -match '\.css$|\.scss$|\.less$') {
        return "style"
    }
    
    # Check for package files
    if ($changedFiles -match 'package\.json$|yarn\.lock$|package-lock\.json$') {
        return "chore"
    }
    
    # Default to feat for new features
    return "feat"
}

# Add all changes to staging area
git add .

# Get list of changed files
$changedFiles = git diff --cached --name-only

# If no changes, exit
if (-not $changedFiles) {
    Write-Host "No changes to commit. Make sure you have added your files with 'git add'."
    exit
}

# Get commit type based on changed files
$commitType = Get-CommitType

# Create a descriptive message based on changed files
$fileNames = $changedFiles -join ", "
$commitMessage = "Update $fileNames"

# Create commit message with files
$fullMessage = "$commitType`: $commitMessage`n"
if ($changedFiles) {
    $fullMessage += "`nChanged files:`n"
    foreach ($file in $changedFiles) {
        $fullMessage += "- $file`n"
    }
}

# Create temporary file for commit message
$tempFile = [System.IO.Path]::GetTempFileName()
$fullMessage | Out-File -FilePath $tempFile -Encoding utf8

# Execute git commit
git commit -F $tempFile

# Clean up
Remove-Item $tempFile 