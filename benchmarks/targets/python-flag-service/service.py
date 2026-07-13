def assign_flag(user_id: str, enabled_percent: int = 50) -> bool:
    if not 0 <= enabled_percent <= 100:
        raise ValueError("enabled_percent must be 0..100")
    score = sum((index + 1) * ord(char) for index, char in enumerate(user_id)) % 100
    return score < enabled_percent
