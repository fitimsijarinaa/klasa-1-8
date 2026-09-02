# Unit Test Generator

Generate professional PHPUnit unit tests for PHP classes and methods using modern attributes and best practices.

## Instructions for AI Assistant

When user invokes `/unit-test`, execute the following steps:

### 1. Version Detection
- Detect PHP version from Docker container using `docker compose exec php php --version`
- Detect PHPUnit, Symfony, Pimcore versions from composer.json/composer.lock
- Display detected versions in the response

### 2. File Analysis
- Analyze the PHP file provided in chat context
- Identify the class and its namespace
- If multiple methods in class, ask user which method to test
- If uncertain about which method to test, ask the user to specify

### 3. Test File Location
- Determine test file location based on PSR-4 mapping
- Example: `src/Service/MyService.php` → `tests/Unit/Service/MyServiceTest.php`
- Show the determined test file path

### 4. Testability Assessment (CRITICAL - Execute Before Generation)

**Before generating ANY tests, perform qualitative assessment:**

**Step 1: Analyze method structure**
- Count dependencies (constructor params, method params, static calls)
- Identify dependency types:
  - Simple data (Request, arrays, DTOs) → Use real instances
  - Pimcore models (Product, QuantityValue) → Use real/test instances if possible
  - External services (Logger, Translator, Factory) → Mock
  - Static calls (Translation::getByKey) → Mark as testability concern

**Step 2: Evaluate test value**

**REJECT if method is:**
- Simple getter/setter (<5 lines, just return property)
- Thin wrapper that only delegates to one other service
- Pure pass-through with no transformation logic
- Constructor with only assignments (no logic)

**PROCEED with WARNING if:**
- Uses static methods (Translation::getByKey) → Suggest refactoring to injectable service
- Requires mocking >3 dependencies → Consider integration test
- Method is mostly orchestration (many service calls, little calculation)

**PROCEED if method has:**
- Business logic (calculations, transformations, validations)
- Conditional branches worth testing
- Edge cases that need verification
- Data transformation/formatting

**Step 3: Display assessment in format:**
```
=== Testability Assessment ===
Class: App\Service\ExtendedDetailsService
Method: buildExtendedDetailsData()

Dependencies:
- Product (Pimcore model) → Use real/test instance
- Request (Symfony) → Use real instance
- Translation::getByKey() (static) → ⚠️ Testability concern

Complexity: Medium
- Contains conditional logic (null checks, empty checks)
- Data transformation (temperature range formatting)
- Business logic present

Mock requirements: Minimal (0-1 mocks needed)
Recommendation: ✅ PROCEED - Good candidate for unit test
Note: Static Translation call could be refactored to injectable service for better testability
```

**Before generating, ask:**
1. Does this method have logic worth testing? (calculations, transformations, validations)
2. Can I test the OUTPUT without excessive mocking? (if no, consider integration test)
3. Would this test catch real bugs? (if only catches refactoring, skip)
4. Is mock setup >50% of test code? (if yes, too mocked)

### 5. Test Generation

Generate comprehensive unit tests following these guidelines:

**Modern PHPUnit Features:**
- Use #[Test] and #[DataProvider] attributes (requires PHP 8.0+)
- Follow English naming conventions for method names and comments (e.g., "testItLogsSuccessfully")
- Structure tests using Arrange / Act / Assert (AAA) pattern
- Optionally use Given / When / Then-style comments for complex business logic
- Use exactly one assertion per test method

**Test Coverage:**
- Include tests for edge cases, boundary conditions, and invalid inputs
- Test minimum and maximum valid input values
- Test empty inputs, null values, or incorrect data types
- Test any possible off-by-one errors in loops or ranges
- Test special cases like zero, empty arrays, or very large numbers

**Minimal Mocking Strategy:**

**DO NOT mock (use real/test instances):**
- Value objects: QuantityValue, Unit, QuantityValueRange, etc.
- Simple data: Request, arrays, DTOs, simple objects
- Pimcore models when possible: Use test instances or simple doubles (not full mocks)
- Immutable/data container objects

**DO mock (external boundaries):**
- LoggerInterface (has side effects, not relevant to logic)
- TranslatorInterface (external service)
- Factory classes (complex infrastructure)
- API clients, HTTP clients
- Database repositories (if testing business logic, not data access)

**HANDLE STATIC METHODS:**
- If method uses static calls (e.g., Translation::getByKey):
  - Add warning in assessment
  - Suggest refactoring to injectable service in comments
  - For now: Test with real static calls (if possible) or document limitation
  - In generated test, add comment:
```php
/**
 * NOTE: This method uses Translation::getByKey() which is a static call.
 * For better testability, consider refactoring to injectable TranslationService.
 * Current test uses real static call with try/catch fallback.
 */
```
- If static method makes testing impossible, suggest refactoring instead of generating test

**Mock sparingly principle:**
- Count mocks: If >3 mocks needed, add warning
- If >50% of dependencies are mocks, consider integration test alternative
- Display warning: `⚠️ WARNING: This method requires mocking 4 of 5 dependencies. Consider: Integration test might provide more value`

**Test Doubles Selection (when mocking is necessary):**
- Use a mock to verify interactions (e.g., method calls, parameters) - but only for critical behavior
- Use a stub to return predefined values when no interaction verification is needed
- Use a dummy for unused but required parameters
- Use a fake for simplified in-memory or stubbed logic

**Behavior vs Implementation Testing:**

**BAD - Testing implementation:**
```php
// ❌ BAD: Only verifies call sequence
$this->product->expects($this->once())->method('getObjectbricks');
$this->objectBricks->expects($this->once())->method('getProductTemperatures');
$this->productTemp->expects($this->once())->method('getAmbientTemperature');
// No assertion on actual result
```

**GOOD - Testing behavior:**
```php
// ✅ GOOD: Verifies actual output
$result = $service->buildExtendedDetailsData($product, $request);
$this->assertNotNull($result);
$this->assertEquals('20 bis 30', $result['objectBricks']['ProductTemperatures']['ambientTemperature']['formatted']);
```

**Guidelines:**
- Primary assertions: Return value, output structure, transformed data
- Secondary assertions: Critical state changes
- Avoid: Verifying every method call unless it's critical behavior
- Rule: If >50% of assertions are `expects()->method()`, reconsider approach

**Exception Handling:**
- Handle exceptions thrown by the method or its dependencies using PHPUnit's `expectException()` or `expectExceptionMessage()`
- Ensure the test verifies that exceptions are thrown under expected failure conditions
- Assert that the correct exception is thrown, and verify the correctness of the exception message or type

**Custom Assertions:**
- Use a custom assertion method when logic is reused or improves clarity
- Ensure expressive, intention-revealing names (e.g., assertUserIsActive())
- Provide meaningful failure messages and avoid hiding complex logic inside assertions
- Extract repeated assertions to a base test class when reused across tests

**Setup & Teardown:**
- Use setUp() and tearDown() methods if multiple tests share common configuration or resources

### 6. When NOT to Test

**Skip unit test generation for:**

1. **Simple getters:**
```php
public function getId(): int {
    return $this->id;
}
```

2. **Thin wrappers:**
```php
public function search(string $query): array {
    return $this->searchService->search($query);
}
```

3. **Pure delegation:**
```php
public function log(string $message): void {
    $this->logger->info($message);
}
```

4. **Constructor with only assignments:**
```php
public function __construct(LoggerInterface $logger) {
    $this->logger = $logger;
}
```

**If method falls into these categories:**
- Display assessment with recommendation to skip
- Explain why: "Method is a simple wrapper/delegation with no testable business logic"
- Suggest alternative: Integration test if method is important but hard to unit test
- Suggest refactoring if method is too tightly coupled

### 7. Fallback Handling
- Never invent behavior or dependencies that are not present in the method or visible context
- If context is missing (e.g., incomplete method body, unresolved service), return a concise diagnostic summary and ask for additional clarification
- Do not generate placeholder tests. Instead, explain clearly why a test cannot be created yet, and suggest how to resolve the issue
- If testability assessment shows method is not suitable for unit testing, clearly explain why and suggest alternatives

### 8. Output Format

**Step 1: Display Assessment**
```
=== Testability Assessment ===
Class: App\Service\ExtendedDetailsService
Method: buildExtendedDetailsData()

Dependencies: 3 (Product, Request, Translation static)
Mock requirements: 0-1 (only Translation if we refactor)
Complexity: Medium (conditional logic, data transformation)
Recommendation: ✅ PROCEED
```

**Step 2: Display detected versions**
- PHP version (from Docker container)
- PHPUnit, Symfony, Pimcore versions (from composer.json/composer.lock)

**Step 3: Show test file path**
- Determined test file location based on PSR-4 mapping

**Step 4: If proceeding, generate complete test class with:**
- Proper namespace
- Modern PHPUnit attributes (#[Test], #[DataProvider])
- setUp/tearDown if needed
- Multiple test methods for different scenarios
- DataProviders for parameterized tests
- Custom assertions if applicable
- **Prominent comment if heavy mocking required:**
```php
/**
 * NOTE: This test requires mocking 4 of 5 dependencies.
 * Consider complementing with integration tests for more comprehensive coverage.
 * @see tests/Functional/Service/MyServiceFunctionalTest.php
 */
```
- **Warning if static methods used:**
```php
/**
 * NOTE: This method uses Translation::getByKey() which is a static call.
 * For better testability, consider refactoring to injectable TranslationService.
 * Current test uses real static call with try/catch fallback.
 */
```
- Clear statement of what the test verifies (behavior, not implementation)

**Step 5: Ask if user wants to create the test file or just view the code**

## Example Usage

```
User has src/Service/ProductService.php open with cursor on calculateDiscount() method
User types: /unit-test

AI responds:

=== Testability Assessment ===
Class: App\Service\ProductService
Method: calculateDiscount()

Dependencies: 2 (Product, User)
- Product (Pimcore model) → Use real/test instance
- User (Pimcore model) → Use real/test instance

Complexity: Medium
- Contains calculation logic
- Conditional logic based on user type/discount rules
- Business logic present

Mock requirements: None (0 mocks needed)
Recommendation: ✅ PROCEED - Good candidate for unit test

Detected: PHP 8.2.28 (Docker), PHPUnit 11.x, Symfony 6.4, Pimcore 2024.2
Class: App\Service\ProductService
Method: calculateDiscount(Product $product, User $user): float
Test file: tests/Unit/Service/ProductServiceTest.php

[Generates complete test class with behavior-focused assertions]

Shall I create this test file?
```

**Example with rejection:**
```
=== Testability Assessment ===
Class: App\Service\ProductService
Method: getId()

Dependencies: 0
Complexity: Trivial
- Simple getter, returns property value
- No business logic

Recommendation: ❌ SKIP - Simple getter with no testable logic
Reason: Method is a simple property accessor with no business logic worth testing.
Alternative: This method is typically covered by integration tests or tests of methods that use it.
```

## Important Notes

**Key Principles:**
1. **Qualitative over quantitative**: Use heuristics and practical judgment, not rigid metrics
2. **Reject low-value tests**: Simple getters/wrappers don't need tests - better to skip than generate meaningless tests
3. **Mock minimally**: Only mock boundaries (external services), use real objects for data and value objects
4. **Test behavior, not implementation**: Verify output and behavior, not call sequences
5. **Warn on problems**: Static methods, heavy mocking (>3 mocks or >50% dependencies) → warn user
6. **Pragmatic approach**: Better to skip a test than generate a test that's mostly mock setup with little value

**Language and Context:**
- All comments, test names, and outputs must be written in English
- When using Copilot Chat, rely on the referenced files and context
- Include file references and make sure to consider the full context provided in the files
- Ensure that all comments, test names, and other outputs are written in English, regardless of the language of the input code or method names

**Testing Guidelines:**
- Always perform testability assessment BEFORE generating tests
- If method uses Symfony services (logger, repository, API), evaluate if mocking is necessary (mock only if it's a boundary, not if it's simple data)
- Follow PSR-4 namespace mapping for test file location
- Generate tests that are clean, isolated, maintainable, and reflect the actual behavior of the method
- Focus on testing OUTPUT and BEHAVIOR, not implementation details
- If a test would require excessive mocking (>50% of dependencies), consider suggesting integration test instead
