provider "aws" {
  # region = "us-east-1" // N. Virginia
  region = "ap-southeast-2" // Sydney
}

data "aws_region" "current" {}

# dynamodb
resource "aws_dynamodb_table" "poc" {
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
    command = "bash ${path.module}/dynamodb/init_db_data.sh ${aws_dynamodb_table.poc.name} ${data.aws_region.current.name}"
  }
}

# appsync api
resource "aws_appsync_graphql_api" "poc" {
  name                = "poc_appsync_dynamodb_appsync"
  authentication_type = "API_KEY" # other options: API_KEY, AWS_IAM, AMAZON_COGNITO_USER_POOLS, OPENID_CONNECT
  schema              = file("appsync/schema.graphql")
}

resource "aws_appsync_api_key" "poc" {
  api_id = aws_appsync_graphql_api.poc.id
}

# appsync datasource_datasource
resource "aws_appsync_datasource" "dynamodb" {
  api_id           = aws_appsync_graphql_api.poc.id
  name             = "dynamoDataSource"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_role.arn

  dynamodb_config {
    table_name = aws_dynamodb_table.poc.name
  }
}

resource "aws_appsync_datasource" "none" {
  api_id           = aws_appsync_graphql_api.poc.id
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
        Resource = aws_dynamodb_table.poc.arn
      }
    ]
  })
}

# appsync query_getItem resolver
resource "aws_appsync_resolver" "mutation_createSite" {
  api_id      = aws_appsync_graphql_api.poc.id
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
  api_id      = aws_appsync_graphql_api.poc.id
  type        = "Query"
  field       = "getSite"
  data_source = aws_appsync_datasource.dynamodb.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Query.getSite.js")
}

resource "aws_appsync_resolver" "mutation_createPost" {
  api_id      = aws_appsync_graphql_api.poc.id
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
  api_id      = aws_appsync_graphql_api.poc.id
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
  api_id      = aws_appsync_graphql_api.poc.id
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
  api_id      = aws_appsync_graphql_api.poc.id
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
  api_id      = aws_appsync_graphql_api.poc.id
  type        = "Mutation"
  field       = "startPageTransition"
  data_source = aws_appsync_datasource.none.name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = file("appsync/resolvers/Multation.startPageTransition.js")
}
