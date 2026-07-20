"""
Lightweight helpers for analytics (no external dependencies).
"""


def parse_user_agent(ua_string):
    """
    Very small, dependency-free User-Agent parser. Good enough for basic
    analytics buckets — not a full replacement for a library like
    user-agents/ua-parser, but avoids adding an external dependency.

    Returns a dict: {"device_type": str, "browser": str, "os": str}
    """
    ua = ua_string or ""
    ua_lower = ua.lower()

    # --- device type ---
    if "ipad" in ua_lower or "tablet" in ua_lower:
        device_type = "tablet"
    elif "mobile" in ua_lower or "iphone" in ua_lower or "android" in ua_lower:
        device_type = "mobile"
    else:
        device_type = "desktop"

    # --- browser (order matters: check Edge/Chrome before Safari, since
    # both Chrome's and Edge's UA strings also contain "Safari") ---
    if "edg/" in ua_lower or "edge/" in ua_lower or "edga/" in ua_lower or "edgios/" in ua_lower:
        browser = "Edge"
    elif "opr/" in ua_lower or "opera" in ua_lower:
        browser = "Opera"
    elif "chrome/" in ua_lower or "crios/" in ua_lower:
        browser = "Chrome"
    elif "firefox/" in ua_lower or "fxios/" in ua_lower:
        browser = "Firefox"
    elif "safari/" in ua_lower:
        browser = "Safari"
    else:
        browser = "Other"

    # --- os ---
    if "windows" in ua_lower:
        os_name = "Windows"
    elif "android" in ua_lower:
        os_name = "Android"
    elif "iphone" in ua_lower or "ipad" in ua_lower or "ios" in ua_lower:
        os_name = "iOS"
    elif "mac os" in ua_lower or "macintosh" in ua_lower:
        os_name = "Mac"
    elif "linux" in ua_lower:
        os_name = "Linux"
    else:
        os_name = "Other"

    return {"device_type": device_type, "browser": browser, "os": os_name}


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
