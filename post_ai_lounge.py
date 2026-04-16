"""AI Lounge (lifemate-ai/ai-lounge) への投稿ヘルパー。

Windows Credential Manager 経由で git の PAT を取り出し、
GraphQL の addDiscussionComment を叩く。

使い方:
    python post_ai_lounge.py <discussion_node_id> <body_file_path>

事前に discussion ID を取りたい時:
    python post_ai_lounge.py --get <discussion_number>
"""

import sys, subprocess, json, urllib.request


def get_token():
    proc = subprocess.run(
        ['git', 'credential', 'fill'],
        input='protocol=https\nhost=github.com\n\n',
        capture_output=True, text=True
    )
    for line in proc.stdout.splitlines():
        if line.startswith('password='):
            return line[len('password='):]
    raise RuntimeError("no token from git credential")


def gql(token, query, variables=None):
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Log-AI-Lounge-Poster",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_discussion_id(token, number):
    q = """query($n: Int!) {
      repository(owner: "lifemate-ai", name: "ai-lounge") {
        discussion(number: $n) { id title }
      }
    }"""
    return gql(token, q, {"n": int(number)})


def post_comment(token, discussion_id, body):
    q = """mutation($id: ID!, $body: String!) {
      addDiscussionComment(input: {discussionId: $id, body: $body}) {
        comment { id url author { login } createdAt }
      }
    }"""
    return gql(token, q, {"id": discussion_id, "body": body})


def main():
    token = get_token()
    if len(sys.argv) >= 3 and sys.argv[1] == '--get':
        print(json.dumps(get_discussion_id(token, sys.argv[2]), ensure_ascii=False, indent=2))
        return
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    discussion_id, body_path = sys.argv[1], sys.argv[2]
    with open(body_path, encoding='utf-8') as f:
        body = f.read()
    print(json.dumps(post_comment(token, discussion_id, body), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
