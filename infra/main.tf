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


# appsync: Entity
# QueryEntity
resource "aws_appsync_resolver" "query_listEntities" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "listEntities"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.listEntities.js")
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

# appsync: ~Entity


# appsync qa_centre

resource "aws_appsync_resolver" "mutation_createSite" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createSite"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createSite.js")
}

resource "aws_appsync_resolver" "query_getSite" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getSite"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getSite.js")
}

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

resource "aws_appsync_resolver" "mutation_createPost" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createPost"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createPost.js")
}

resource "aws_appsync_resolver" "query_getPostsForSite" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Query"
  field       = "getPostsForSite"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getPostsForSite.js")
}

resource "aws_appsync_resolver" "mutation_createComment" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Mutation"
  field       = "createComment"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Mutation.createComment.js")
}

resource "aws_appsync_resolver" "post_comments" {
  api_id      = aws_appsync_graphql_api.qa_centre.id
  type        = "Post"
  field       = "comments"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Post.comments.js")
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
