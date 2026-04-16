USER_HISTORY = {}

def store_user_pattern(prompt, entities):
    USER_HISTORY[prompt] = entities


def recall_pattern(prompt):
    return USER_HISTORY.get(prompt, None)