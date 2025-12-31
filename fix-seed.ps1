$file = "d:\Projek\coreKop\koperasiProjek\koperasi-backend\prisma\seed_report_variables.ts"
$content = Get-Content $file -Raw

# Replace all instances of jsonSchema with object to jsonSchema with JSON.stringify
# Pattern: jsonSchema: { ... } where we need to find the matching closing brace

# Since regex for nested braces is complex, we'll use a simple replacement for known patterns
# Each jsonSchema assignment needs: jsonSchema: JSON.stringify({ ... })

$content = $content -replace 'jsonSchema: \{', 'jsonSchema: JSON.stringify({'

# Now we need to add closing ) after each jsonSchema block
# We know each jsonSchema block ends before the closing of the create data object
# Pattern to look for: multiple closing braces followed by "}"  for the data object

# Find pattern like:          ]
#          }
#      } 
# Change to:          ]
#          })
#      }

$content = $content -replace '(\s+\]\r\n\s+)\}(\r\n\s+)\}(\r\n\s+)\}\);', '$1})$2}$3});'

Set-Content $file $content -NoNewline
Write-Host "Fixed jsonSchema in seed file"
