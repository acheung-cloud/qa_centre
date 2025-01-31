#!/bin/bash

# call this script like so:
# bash init_db_data.sh qa_centre_table ap-southeast-2
# bash init_db_data.sh QACentre-pcmp54jhqnf7zbo2jwj7ngjrw4-NONE ap-southeast-2



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

# Create temporary copies of json files with the table name replaced
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/Entity.json" > "${SCRIPT_DIR}/data/Entity.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/Group.json" > "${SCRIPT_DIR}/data/Group.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/Session.json" > "${SCRIPT_DIR}/data/Session.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/Question.json" > "${SCRIPT_DIR}/data/Question.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/AnsOption.json" > "${SCRIPT_DIR}/data/AnsOption.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/User.json" > "${SCRIPT_DIR}/data/User.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/Parti.json" > "${SCRIPT_DIR}/data/Parti.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/ResponseLog.json" > "${SCRIPT_DIR}/data/ResponseLog.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/SessionScore.json" > "${SCRIPT_DIR}/data/SessionScore.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/QALog.json" > "${SCRIPT_DIR}/data/QALog.tmp.json"
sed "s/TABLE_NAME/$TABLE_NAME/g" "${SCRIPT_DIR}/data/OpLog.json" > "${SCRIPT_DIR}/data/OpLog.tmp.json"

# Execute batch-write-item
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Entity.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Group.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Session.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Question.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/AnsOption.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/User.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/Parti.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/ResponseLog.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/SessionScore.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/QALog.tmp.json"
aws dynamodb batch-write-item --request-items "file://${SCRIPT_DIR}/data/OpLog.tmp.json"

# Reset AWS CLI region configuration
aws configure set default.region ""

# Clean up temporary files
rm -f "${SCRIPT_DIR}"/data/*.tmp.json

echo "Data initialization complete!"
