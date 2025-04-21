import argparse
import os
import sys
import warnings
from packaging import version

# Import necessary functions from optuna_dashboard
from optuna_dashboard import run_server
from optuna_dashboard._storage_url import get_storage
from optuna_dashboard.artifact._backend_to_store import ArtifactBackendToStore
from optuna_dashboard.artifact.file_system import FileSystemBackend
from optuna.version import __version__ as optuna_ver # Need optuna version


def main():
    parser = argparse.ArgumentParser(
        description="Run Optuna Dashboard directly from script.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "storage_url", help="Storage URL (e.g. sqlite:///example.db)", type=str
    )
    parser.add_argument(
        "--prefix",
        help="URL prefix for the dashboard (set via env var OPTUNA_DASHBOARD_ROOT_PREFIX)",
        type=str,
        default="",
    )
    parser.add_argument(
        "--port", help="Port number", type=int, default=8080
    )
    parser.add_argument(
        "--host", help="Hostname", type=str, default="127.0.0.1"
    )
    parser.add_argument(
        "--artifact-dir",
        help="Directory to store artifact files",
        type=str,
        default=None,
    )
    # Add storage_class argument if needed, similar to CLI
    parser.add_argument(
        "--storage-class",
        help="Storage class hint (e.g. JournalFileStorage)",
        type=str,
        default=None,
    )

    args = parser.parse_args()

    # --- Set Environment Variable for Prefix ---
    prefix = args.prefix
    # Basic sanitization (remove leading/trailing slashes if needed)
    if prefix and not prefix.startswith("/"):
        prefix = "/" + prefix
    if len(prefix) > 1 and prefix.endswith("/"):
        prefix = prefix[:-1]
    if prefix == "/":
        prefix = ""

    # Set the environment variable *before* calling run_server/create_app
    os.environ["OPTUNA_DASHBOARD_ROOT_PREFIX"] = prefix

    # --- Get Storage --- 
    try:
        storage = get_storage(args.storage_url, storage_class=args.storage_class)
    except Exception as e:
        print(f"Error accessing storage: {e}", file=sys.stderr)
        sys.exit(1)

    # --- Create Artifact Store (if specified) ---
    # Replicates logic from _cli.py
    artifact_store = None
    if args.artifact_dir:
        # Create the directory if it doesn't exist
        os.makedirs(args.artifact_dir, exist_ok=True)

        if version.parse(optuna_ver) >= version.Version("3.3.0"):
            from optuna.artifacts import FileSystemArtifactStore
            artifact_store = FileSystemArtifactStore(args.artifact_dir)
        else:
            warnings.warn(
                "Using deprecated FileSystemBackend for artifacts. "
                "Upgrade Optuna to version 3.3.0 or later for the new Artifact API.",
                DeprecationWarning
            )
            artifact_backend = FileSystemBackend(args.artifact_dir)
            artifact_store = ArtifactBackendToStore(artifact_backend)

    # --- Run Server --- 
    print("Starting Optuna Dashboard...")
    print(f"  Storage URL: {args.storage_url}")
    print(f"  Root Prefix: {os.environ['OPTUNA_DASHBOARD_ROOT_PREFIX']}")
    print(f"  Host: {args.host}")
    print(f"  Port: {args.port}")
    if args.artifact_dir:
        print(f"  Artifact Dir: {args.artifact_dir}")
    print("Press Ctrl+C to quit.")

    try:
        run_server(
            storage=storage,
            host=args.host,
            port=args.port,
            artifact_store=artifact_store
        )
    except KeyboardInterrupt:
        print("\nDashboard stopped.")
        sys.exit(0)
    except Exception as e:
        print(f"\nError running dashboard: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 