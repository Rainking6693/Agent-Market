from __future__ import annotations

import uuid


def new_uuid() -> str:
    return str(uuid.uuid4())


def unique_email(namespace: str = "agents.test") -> str:
    return f"{new_uuid()}@{namespace}"


def unique_agent_name() -> str:
    return f"qa-agent-{new_uuid()[:8]}"
from __future__ import annotations

import random
import string
import uuid


def random_suffix(length: int = 6) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(random.choice(alphabet) for _ in range(length))


def unique_email(domain: str = "example.com") -> str:
    return f"user-{uuid.uuid4().hex[:8]}@{domain}"


def unique_agent_name(prefix: str = "QA Agent") -> str:
    return f"{prefix} {random_suffix()}"


def new_uuid() -> str:
    return str(uuid.uuid4())
from __future__ import annotations

import random
import string
import uuid


def random_suffix(length: int = 6) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(random.choice(alphabet) for _ in range(length))


def unique_email(domain: str = "example.com") -> str:
    return f"user-{uuid.uuid4().hex[:8]}@{domain}"


def unique_agent_name(prefix: str = "QA Agent") -> str:
    return f"{prefix} {random_suffix()}"


def new_uuid() -> str:
    return str(uuid.uuid4())

