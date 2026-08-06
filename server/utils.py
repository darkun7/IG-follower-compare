import re
import json
from io import StringIO
import csv


def _parse_csv_string(content: str) -> list[dict]:
    cleaned = content.replace("\r", "\n")
    reader = csv.DictReader(StringIO(cleaned))
    return list(reader)


def _parse_json_usernames(content: str) -> set[str]:
    """Extract usernames from an Instagram data export JSON file.

    Handles multiple known formats:
      - followers_1.json  -> top-level JSON array of {"string_list_data": [...]}
      - following.json    -> {"relationships_following": [{"string_list_data": [...]}]}
      - alt format        -> [{"username": "..."}] or [{"value": "..."}]
      - href fallback     -> extract instagram.com/username from any "href" field
    """
    usernames = set()
    try:
        data = json.loads(content)
    except Exception:
        return usernames

    def walk(obj):
        if isinstance(obj, dict):
            # Standard Instagram format: {"string_list_data": [{"value": "user"}]}
            if "string_list_data" in obj:
                for item in obj["string_list_data"]:
                    value = item.get("value", "").strip().lower()
                    # No "value" field — extract from href like instagram.com/_u/username
                    if not value and "href" in item:
                        m = re.search(r"instagram\.com/(?:_u/)?([A-Za-z0-9._]{1,30})/?$", str(item["href"]))
                        if m:
                            value = m.group(1).lower()
                    if value:
                        usernames.add(value)
            # Alternative: {"username": "user"}
            elif "username" in obj:
                value = obj["username"].strip().lower()
                if value:
                    usernames.add(value)
            # Alternative: {"value": "user"} (top-level without string_list_data)
            elif "value" in obj and "string_list_data" not in obj:
                value = obj["value"].strip().lower()
                if value:
                    usernames.add(value)
            # Fallback: look for "href" containing instagram.com/user
            elif "href" in obj:
                href = str(obj["href"])
                m = re.search(r"instagram\.com/([A-Za-z0-9._]{1,30})/?$", href)
                if m:
                    usernames.add(m.group(1).lower())
            else:
                for v in obj.values():
                    walk(v)
        elif isinstance(obj, list):
            for item in obj:
                walk(item)

    walk(data)
    return usernames


def _extract_usernames(rows: list[dict], username_key: str = "Username") -> set[str]:
    usernames = set()
    for row in rows:
        username = row.get(username_key, "").strip().lower()
        if username and username != "username":
            usernames.add(username)
    return usernames


def parse_followers_section(content: str) -> set[str]:
    sections = re.split(r"(?:^|\n)Your tags and follows\n", content)
    if len(sections) < 2:
        return set()

    body = sections[1]
    tables = re.split(r"\n\n", body)
    followers_table = None
    for table_text in tables:
        lines = [l.strip()
                 for l in table_text.strip().splitlines() if l.strip()]
        if len(lines) >= 2 and lines[0].lower().startswith("follower"):
            followers_table = table_text.strip()
            break

    if not followers_table:
        return set()

    lines = [l.strip() for l in followers_table.strip().splitlines() if l.strip()]
    usernames = set()

    # Legacy plain-text format:
    #   followers
    #   Username
    #   alice
    #   bob
    if len(lines) >= 2 and lines[0].lower().startswith("follower") and lines[1].lower() == "username":
        for line in lines[2:]:
            username = line.lower()
            if username and username != "username":
                usernames.add(username)
        return usernames

    reader = csv.DictReader(StringIO(followers_table))
    for row in reader:
        username = row.get("Username", "").strip().lower()
        if username and username != "username":
            usernames.add(username)
    return usernames


def _extract_instagram_links(content: str) -> set[str]:
    """Extract profile usernames from instagram.com links (HTML export)."""
    usernames = set()
    reserved = {
        "accounts", "reel", "p", "explore", "login", "about", "help",
        "developer", "privacy", "terms", "discover", "directory", "tags",
        "stories", "direct", "settings", "www", "r", "share", "create",
    }
    pattern = re.compile(r"instagram\.com/([A-Za-z0-9._]{1,30})(?:/)?[^\w]")
    for m in pattern.finditer(content):
        user = m.group(1).strip().lower().rstrip(".")
        if user and user not in reserved and not user.endswith(".com"):
            usernames.add(user)
    return usernames


def instagram_parse(content: str, file_type: str = "auto") -> set[str]:
    """Parse Instagram data and extract usernames."""
    # Strip BOM if present
    content = content.lstrip("\ufeff").strip()

    if not content:
        return set()

    # Standard Instagram JSON export (followers_1.json / following.json)
    if content.lstrip().startswith(("{", "[")):
        return _parse_json_usernames(content)

    # Try to detect format based on content structure
    if "Username" in content.replace(" ", "") or "username" in content.lower():
        rows = _parse_csv_string(content)
        usernames = _extract_usernames(rows)
        if usernames:
            return usernames

    # HTML export: extract usernames from instagram.com profile links
    usernames = _extract_instagram_links(content)
    if usernames:
        return usernames

    # Maybe it's the special "followers" HTML-ish format
    return parse_followers_section(content)


def compare_lists(data: dict) -> dict:
    """Compare followers and following lists, returning mutuals, not folback, etc."""
    followers_raw = data.get("followers", "")
    following_raw = data.get("following", "")
    follower_file_type = data.get("followerFileType", "auto")
    following_file_type = data.get("followingFileType", "auto")

    followers = instagram_parse(followers_raw, follower_file_type)
    following = instagram_parse(following_raw, following_file_type)

    mutuals = sorted(followers & following)
    not_folback = sorted(following - followers)
    only_followers = sorted(followers - following)
    only_following = sorted(following - followers)

    return {
        "mutuals": [{"username": u, "profile_url": f"https://instagram.com/{u}"}
                    for u in mutuals],
        "notFolback": [{"username": u, "profile_url": f"https://instagram.com/{u}"
                        } for u in not_folback],
        "onlyFollowers": [{"username": u, "profile_url": f"https://instagram.com/{u}"
                           } for u in only_followers],
        "onlyFollowing": [{"username": u, "profile_url": f"https://instagram.com/{u}"
                           } for u in only_following],
    }
