# Bruno GraphQL Request Format für Pimcore

## Funktionierendes Format basierend auf working.bru

### 1. Headers (ohne zusätzliche Anführungszeichen um {{}} Variablen)
```bru
headers {
  apikey: {{apiKey}}
  Content-Type: application/json
}
```

**NICHT:**
```bru
headers {
  'apikey': '{{apiKey}}'
  'Content-Type': 'application/json'
}
```

### 2. Body als JSON (nicht graphql)
```bru
body:json {
  {"query": "{ getProductListing { edges { node { id } } } }"}
}
```

**NICHT:**
```bru
body:graphql {
  query {
    getProductListing {
      edges {
        node {
          id
        }
      }
    }
  }
}
```

### 3. URL mit Variablen
```bru
post {
  url: {{baseUrl}}{{graphqlEndpoint}}
  body: json
  auth: none
}
```

### 4. Korrekte Pimcore DataHub URLs
- **API Endpoint**: `http://localhost/pimcore-graphql-webservices/AI_Integration`
- **Browser/Playground**: `http://localhost/pimcore-datahub-webservices/explorer/AI_Integration`

### 5. MCP vs. Manuell
- **MCP**: Erstellt falsche Header-Syntax mit JSON-Strings
- **Manuell**: Funktioniert mit korrekter Bruno-Syntax

### 6. Vollständiges Beispiel
```bru
meta {
  name: 'working request'
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}{{graphqlEndpoint}}
  body: json
  auth: none
}

headers {
  apikey: {{apiKey}}
  Content-Type: application/json
}

body:json {
  {"query": "{ getProductListing { edges { node { id } } } }"}
}
```

## Environment Variables
```bru
vars {
  baseUrl: http://localhost
  graphqlEndpoint: /pimcore-graphql-webservices/AI_Integration
  apiKey: d05251ed86e865ba1f6215bac4e28c78
  environment: local
}
```
