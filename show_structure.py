import os

# ✅ Include only these top-level folders
INCLUDE_TOP_LEVEL = {
    "IonaBrandBackEnd",
    "control_console",
    "admin_users",
    "utils",
    "static",
    "admin",
    "user-management",
    "css",
    "images",
    "js",
    "templates",
}

# ❌ Always ignore these folder names anywhere in the tree
EXCLUDE_FOLDERS = {"__pycache__"}


def print_tree(start_path, prefix=""):
    try:
        items = sorted(os.listdir(start_path))
    except PermissionError:
        return

    for i, name in enumerate(items):
        path = os.path.join(start_path, name)

        # Skip excluded folders
        if name in EXCLUDE_FOLDERS:
            continue

        # Only show whitelisted top-level folders
        if prefix == "" and name not in INCLUDE_TOP_LEVEL:
            continue

        connector = "└── " if i == len(items) - 1 else "├── "
        print(prefix + connector + name)

        if os.path.isdir(path):
            extension = "    " if i == len(items) - 1 else "│   "
            print_tree(path, prefix + extension)


print_tree(".")
