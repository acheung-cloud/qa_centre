#!/bin/bash

# call this script like so:
# bash init_db_data.sh qa_centre_table ap-southeast-2

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

# Execute batch-write-item
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Entity.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Group.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Session.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Question.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/AnsOption.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/User.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Parti.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/ResponseLog.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/SessionScore.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/QALog.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/OpLog.json"

# for debug only
aws dynamodb put-item \
    --table-name $TABLE_NAME \
    --item "file://${SCRIPT_DIR}/data/site.json"

# Cleanup: Reset AWS CLI region setting if necessary
aws configure set default.region ""

echo "Data initialization complete!"

# Test commands
# ./dynamodb/init_db_data.sh qa_centre_table ap-southeast-2
# ./dynamodb/clean_db.sh qa_centre_table ap-southeast-2