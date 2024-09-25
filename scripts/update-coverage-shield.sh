coverageSummaryPath="./coverage/coverage-summary.json"

if [ ! -f $coverageSummaryPath ]; then
    echo -e "\033[0;31mCoverage summary not found at \"$coverageSummaryPath\"!"
    exit 1
fi

stmtsCoverageFromJSON=$(node -p "require('$coverageSummaryPath').total.statements.pct")

if [ -z "$stmtsCoverageFromJSON" ]; then
    echo -e "\033[0;31mCould not read coverage percentage!"
    exit 1
fi

# Convert the string to a decimal number:
stmtsCoverage=$(echo "$stmtsCoverageFromJSON" | awk '{printf "%d", $1 * 100}')

# Set the color based on the coverage value
if (( stmtsCoverage < 5000 )); then
    badgeColor="FF0000"
elif (( stmtsCoverage < 8000 )); then
    badgeColor="FFFF00"
else
    badgeColor="008000"
fi

echo -e "\033[0;32m✔\033[0m Updating 'Stmts Coverage' shield to '${stmtsCoverageFromJSON}%'..."

sed -i -e "s/Stmts_Coverage-.*%25.*)]/Stmts_Coverage-${stmtsCoverageFromJSON}%25-black?style=for-the-badge\&color=%23${badgeColor})]/" ./README.md
# -i = in-place edit
# Note there's no g flag used in the regular expression to make sure only one line is affected (just in case).

git add ./README.md
