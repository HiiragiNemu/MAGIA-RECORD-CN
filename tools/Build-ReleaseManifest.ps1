param(
    [Parameter(Mandatory = $true)]
    [string] $SourceRoot,

    [Parameter(Mandatory = $true)]
    [string] $OutputPath,

    [long] $ThresholdBytes = 99614720
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $SourceRoot).Path

$assets = @(
    Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File -Force |
        Where-Object { $_.Length -gt $ThresholdBytes } |
        Sort-Object FullName |
        ForEach-Object {
            [ordered]@{
                path = $_.FullName.Substring($resolvedRoot.Length + 1)
                bytes = $_.Length
                sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            }
        }
)

$manifest = [ordered]@{
    schemaVersion = 1
    sourceRootName = Split-Path -Leaf $resolvedRoot
    thresholdBytes = $ThresholdBytes
    generatedAtUtc = [DateTime]::UtcNow.ToString('o')
    assets = $assets
}

$manifest |
    ConvertTo-Json -Depth 6 |
    Set-Content -LiteralPath $OutputPath -Encoding utf8NoBOM
