#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if table name and region are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Table name or region not provided. Usage: $0 <table_name> <region>"
    exit 1
fi

TABLE_NAME="$1"
REGION="$2"

echo ">>>>> Initializing data in table $TABLE_NAME in region $REGION"


# Configure AWS CLI with the specified region
aws configure set default.region $REGION

# Insert initial data
# Create Site
aws dynamodb put-item \
    --table-name $TABLE_NAME \
    --item "file://${SCRIPT_DIR}/data/site.json"

# Post 1
aws dynamodb put-item \
    --table-name $TABLE_NAME \
    --item "file://${SCRIPT_DIR}/data/post1.json"

# Post 2
aws dynamodb put-item \
    --table-name $TABLE_NAME \
    --item "file://${SCRIPT_DIR}/data/post2.json"

# Cleanup: Reset AWS CLI region setting if necessary
aws configure set default.region ""