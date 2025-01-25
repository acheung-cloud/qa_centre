provider "aws" {
  # region = "us-east-1" // N. Virginia
  region = "ap-southeast-2" // Sydney
}

data "aws_region" "current" {}

# Variables for manually created Cognito User Pool
variable "cognito_user_pool_id" {
  description = "ID of the manually created Cognito User Pool"
  type        = string
}

# dynamodb
resource "aws_dynamodb_table" "qa_centre" {
  name         = "qa_centre_table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }
  provisioner "local-exec" {
    command = "bash ${path.module}/dynamodb/init_db_data.sh ${aws_dynamodb_table.qa_centre.name} ${data.aws_region.current.name}"
  }
}

# IAM role for Amplify/Next.js backend
resource "aws_iam_role" "amplify_backend" {
  name = "qa_centre_amplify_backend"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for AppSync access from server
resource "aws_iam_role_policy" "amplify_appsync" {
  name = "qa_centre_amplify_appsync"
  role = aws_iam_role.amplify_backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "appsync:GraphQL"
        ]
        Resource = [
          "${aws_appsync_graphql_api.qa_centre.arn}/*"
        ]
      }
    ]
  })
}

# AppSync API with multiple auth
resource "aws_appsync_graphql_api" "qa_centre" {
  name = "qa_centre_appsync"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"
  
  user_pool_config {
    aws_region     = data.aws_region.current.name
    default_action = "ALLOW"
    user_pool_id   = var.cognito_user_pool_id
  }

  # Add IAM auth for server-side access
  additional_authentication_provider {
    authentication_type = "AWS_IAM"
  }
  
  schema = file("appsync/schema.graphql")
}

resource "aws_appsync_api_key" "qa_centre" {
  api_id = aws_appsync_graphql_api.qa_centre.id
}

# appsync datasource_datasource
resource "aws_appsync_datasource" "dynamodb" {
  api_id           = aws_appsync_graphql_api.qa_centre.id
  name             = "dynamoDataSource"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_role.arn

  dynamodb_config {
    table_name = aws_dynamodb_table.qa_centre.name
  }
}

resource "aws_appsync_datasource" "none" {
  api_id           = aws_appsync_graphql_api.qa_centre.id
  name             = "none"
  type             = "NONE"
}

# appsync iam role
resource "aws_iam_role" "appsync_role" {
  name = "appsync-dynamodb-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })
}

# appsync iam role policy
resource "aws_iam_role_policy" "appsync_dynamodb_policy" {
  name = "appsync-dynamodb-policy"
  role = aws_iam_role.appsync_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.qa_centre.arn
      }
    ]
  })
}

resource "aws_appsync_resolver" "mutation_startPageTransition" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "startPageTransition"
  data_source = aws_appsync_datasource.none.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Multation.startPageTransition.js")
}

# appsync: Entity
resource "aws_appsync_resolver" "query_getEntities" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getEntities"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getEntities.js")
}

resource "aws_appsync_resolver" "mutation_createEntity" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createEntity"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createEntity.js")
}

resource "aws_appsync_resolver" "mutation_updateEntity" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateEntity"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateEntity.js")
}

# appsync: ~Entity

# appsync: Group
resource "aws_appsync_resolver" "query_getGroups" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getGroups"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getGroups.js")
}

resource "aws_appsync_resolver" "mutation_createGroup" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createGroup"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createGroup.js")
}

resource "aws_appsync_resolver" "mutation_updateGroup" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateGroup"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateGroup.js")
}

# appsync: ~Group

# appsync: Session

resource "aws_appsync_resolver" "mutation_createSession" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createSession"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createSession.js")
}

resource "aws_appsync_resolver" "query_getSessions" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getSessions"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getSessions.js")
}

# appsync: ~Session

# appsync: Question
resource "aws_appsync_resolver" "query_getQuestions" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getQuestions"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getQuestions.js")
}

resource "aws_appsync_resolver" "mutation_createQuestion" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createQuestion"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createQuestion.js")
}

resource "aws_appsync_resolver" "mutation_updateQuestion" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateQuestion"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateQuestion.js")
}

# appsync: ~Question

# appsync: AnsOption
resource "aws_appsync_resolver" "query_getAnsOptions" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getAnsOptions"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getAnsOptions.js")
}

resource "aws_appsync_resolver" "mutation_createAnsOption" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createAnsOption"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createAnsOption.js")
}

resource "aws_appsync_resolver" "mutation_updateAnsOption" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateAnsOption"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateAnsOption.js")
}

# appsync: ~AnsOption

# appsync: User
resource "aws_appsync_resolver" "query_getUsers" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getUsers"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getUsers.js")
}

resource "aws_appsync_resolver" "mutation_createUser" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createUser"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createUser.js")
}

resource "aws_appsync_resolver" "mutation_updateUser" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateUser"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateUser.js")
}

resource "aws_appsync_resolver" "mutation_loginUser" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "loginUser"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.loginUser.js")
}

# appsync: ~User

# appsync: Parti
resource "aws_appsync_resolver" "query_getPartis" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getPartis"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getPartis.js")
}

resource "aws_appsync_resolver" "mutation_createParti" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createParti"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createParti.js")
}

resource "aws_appsync_resolver" "mutation_updateParti" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateParti"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateParti.js")
}

# appsync: ~Parti

# appsync: ResponseLog
resource "aws_appsync_resolver" "query_getResponseLogs" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getResponseLogs"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getResponseLogs.js")
}

resource "aws_appsync_resolver" "mutation_createResponseLog" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createResponseLog"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createResponseLog.js")
}

resource "aws_appsync_resolver" "mutation_updateResponseLog" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateResponseLog"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateResponseLog.js")
}

# appsync: ~ResponseLog

# appsync: SessionScore
resource "aws_appsync_resolver" "query_getSessionScores" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getSessionScores"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getSessionScores.js")
}

resource "aws_appsync_resolver" "mutation_createSessionScore" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createSessionScore"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createSessionScore.js")
}

resource "aws_appsync_resolver" "mutation_updateSessionScore" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "updateSessionScore"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.updateSessionScore.js")
}

# appsync: ~SessionScore
