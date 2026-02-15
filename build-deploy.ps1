# build-deploy.ps1
# PowerShell script to build Angular app and deploy to GitHub Pages

Write-Host "🔨 Building Angular project..."
ng build

# Check if Angular created a 'browser' folder
if (Test-Path "docs/browser") {
    Write-Host "📂 Flattening docs/browser into docs/"
    Copy-Item -Path "docs/browser/*" -Destination "docs/" -Recurse -Force
    Remove-Item -Path "docs/browser" -Recurse -Force
}

Write-Host "🚀 Deploying to GitHub Pages..."
npx gh-pages -d docs

Write-Host "✅ Deployment complete!"