#!/bin/bash

# Simple script to run Optuna Dashboard with optional root prefix.

# Usage:
# ./run_dashboard.sh <storage_url> [prefix] [port] [host] [artifact_dir]
#
# Examples:
# ./run_dashboard.sh sqlite:///example.db
# ./run_dashboard.sh sqlite:///example.db /myprefix
# ./run_dashboard.sh sqlite:///example.db /myprefix 8081
# ./run_dashboard.sh sqlite:///example.db "" 8080 0.0.0.0 ./artifacts

# Default values
DEFAULT_PORT=8080
DEFAULT_HOST="127.0.0.1"
DEFAULT_PREFIX=""
DEFAULT_ARTIFACT_DIR=""

# Assign arguments
STORAGE_URL="${1}"
PREFIX="${2:-$DEFAULT_PREFIX}"
PORT="${3:-$DEFAULT_PORT}"
HOST="${4:-$DEFAULT_HOST}"
ARTIFACT_DIR="${5:-$DEFAULT_ARTIFACT_DIR}"

# Check if storage URL is provided
if [ -z "${STORAGE_URL}" ]; then
  echo "Error: Storage URL is required."
  echo "Usage: $0 <storage_url> [prefix] [port] [host] [artifact_dir]"
  exit 1
fi

# Export the prefix environment variable
export OPTUNA_DASHBOARD_ROOT_PREFIX="${PREFIX}"

# Build the command arguments
CMD_ARGS=()
CMD_ARGS+=("${STORAGE_URL}")
CMD_ARGS+=(--host "${HOST}")
CMD_ARGS+=(--port "${PORT}")

if [ -n "${ARTIFACT_DIR}" ]; then
  CMD_ARGS+=(--artifact-dir "${ARTIFACT_DIR}")
fi

# Determine the command to run. Assumes 'optuna-dashboard' is in PATH
# If running within a virtual environment, ensure it's activated
# or call the script directly, e.g., /path/to/venv/bin/optuna-dashboard
DASHBOARD_CMD="optuna-dashboard"

# Check if the command exists
if ! command -v ${DASHBOARD_CMD} &> /dev/null
then
    echo "Error: '${DASHBOARD_CMD}' command not found. Make sure optuna-dashboard is installed and your environment (e.g., venv) is activated."
    exit 1
fi

echo "Starting Optuna Dashboard..."
echo "  Storage URL: ${STORAGE_URL}"
echo "  Root Prefix: ${OPTUNA_DASHBOARD_ROOT_PREFIX}"
echo "  Host: ${HOST}"
echo "  Port: ${PORT}"
if [ -n "${ARTIFACT_DIR}" ]; then
  echo "  Artifact Dir: ${ARTIFACT_DIR}"
fi
echo "Running command: ${DASHBOARD_CMD} ${CMD_ARGS[*]}"

# Run the dashboard using the installed script
"${DASHBOARD_CMD}" "${CMD_ARGS[@]}" 