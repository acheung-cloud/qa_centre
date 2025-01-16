#!/bin/bash

# call this script like so:
# bash clean_db.sh qa_centre_table ap-southeast-2

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if table name and region are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Table name or region not provided. Usage: $0 <table_name> <region>"
    exit 1
fi

TABLE_NAME="$1"
REGION="$2"

echo ">>>>> Cleaning all data from table $TABLE_NAME in region $REGION"

# Configure AWS CLI with the specified region
aws configure set default.region $REGION

# Create a temporary file for delete requests
TEMP_FILE=$(mktemp)

# Function to process items and create delete requests
process_items() {
    echo "{\"$TABLE_NAME\": [" > "$TEMP_FILE"
    local first=true
    
    while read -r item; do
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$TEMP_FILE"
        fi
        
        # Extract PK and SK from the item
        local pk=$(echo "$item" | jq -r '.PK.S')
        local sk=$(echo "$item" | jq -r '.SK.S')
        
        # Create delete request
        echo "{
            \"DeleteRequest\": {
                \"Key\": {
                    \"PK\": {\"S\": \"$pk\"},
                    \"SK\": {\"S\": \"$sk\"}
                }
            }
        }" >> "$TEMP_FILE"
    done
    
    echo "]}" >> "$TEMP_FILE"
}

# Scan the table and process items in batches
echo "Scanning table for items..."
aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --attributes-to-get "PK" "SK" \
    --query "Items" \
    --output json | \
    jq -c '.[]' | \
    process_items

# Check if there are items to delete
if [ "$(jq ".${TABLE_NAME} | length" "$TEMP_FILE")" -gt 0 ]; then
    echo "Deleting items..."
    aws dynamodb batch-write-item --request-items "file://$TEMP_FILE"
    echo "Items deleted successfully"
else
    echo "No items found in the table"
fi

# Clean up
rm -f "$TEMP_FILE"

# Cleanup: Reset AWS CLI region setting if necessary
aws configure set default.region ""

echo "Table cleanup complete!"