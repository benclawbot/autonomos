#!/bin/bash
# Unified Test Runner - Spawns Codex with Mistral for testing
# Usage: ./test/run.sh [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Defaults
MODEL="mistral-local"
REPORT_FORMAT="text"
TEST_PATH="./"
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --model)
      MODEL="$2"
      shift 2
      ;;
    --report)
      REPORT_FORMAT="$2"
      shift 2
      ;;
    --path)
      TEST_PATH="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Autonomos Test Runner (Codex + Mistral)${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""
echo "Model: $MODEL"
echo "Test Path: $TEST_PATH"
echo "Report: $REPORT_FORMAT"
echo ""

# Check if liteLLM proxy is running
if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Starting liteLLM proxy...${NC}"
  export MISTRAL_API_KEY="H4OUE5LZB4xWW8H2v8wA3oXZRz50D4C8"
  litellm --config /home/tom/.config/litellm/config.yaml --port 4000 &
  sleep 3
fi

# Run Codex with Mistral
echo -e "${GREEN}🚀 Starting Codex tests...${NC}"
echo ""

export DUMMY_KEY="dummy"

# Run Codex in test mode
codex exec -c model_provider=mistral -m $MODEL --full-auto -C /home/tom/.openclaw/workspace << 'EOF' 2>&1 | tee /tmp/codex-test-output.txt
You are a QA tester. Test the Autonomos Next.js app at /home/tom/.openclaw/workspace/autonomos

1. Run the type checker: cd autonomos && npm run type-check
2. Run the linter: cd autonomos && npm run lint
3. Check the build: cd autonomos && npm run build
4. Start the dev server and test: cd autonomos && npm run dev (then use Playwright or manual test)
5. Report any errors found with file names and line numbers

Focus on:
- TypeScript errors
- ESLint errors
- Build failures
- Runtime errors
- Missing imports
- API route issues

Be thorough - check multiple pages and features.
EOF

# Check result
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Tests passed!${NC}"
else
  echo ""
  echo -e "${RED}❌ Tests failed!${NC}"
  exit 1
fi
