import json, os, urllib.request

TOKEN_URL = 'http://localhost:8080/api/admin/login'
API_URL = 'http://localhost:8080/api/admin/articles'
POSTS = 'D:/kiro项目/新建文件夹 (2)/blog-hugo/content/posts'

# Get token
data = json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
req = urllib.request.Request(TOKEN_URL, data=data, headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req).read())['data']['token']

for f in os.listdir(POSTS):
    if not f.endswith('.md'):
        continue
    slug = f[:-3]
    with open(os.path.join(POSTS, f), 'r', encoding='utf-8') as fh:
        text = fh.read()

    # Determine separator (YAML --- or TOML +++)
    sep = '+++' if text.startswith('+++') else '---'
    parts = text.split(sep)
    if len(parts) < 3:
        continue

    fm_text = parts[1].strip()
    body = parts[2].strip()

    # Parse frontmatter
    fm = {}
    for line in fm_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        if ':' in line:
            k, v = line.split(':', 1)
        elif '=' in line:
            k, v = line.split('=', 1)
        else:
            continue
        k = k.strip().lstrip('- ')
        v = v.strip().strip('"').strip("'")
        if k in ('title', 'summary', 'tags', 'categories'):
            v = v.strip('[]').replace('"', '').replace("'", '')
            fm[k] = v

    title = fm.get('title', '')
    summary = fm.get('summary', '')
    tags = fm.get('tags', '')
    cats = fm.get('categories', '')
    all_tags = ','.join(filter(None, [tags, cats])) if tags and cats else (tags or cats)

    payload = {
        'title': title,
        'slug': slug,
        'content': body,
        'summary': summary,
        'tags': all_tags,
    }

    # Check if article exists
    check_req = urllib.request.Request(f'{API_URL}/{slug}',
                                       headers={'Authorization': f'Bearer {token}'})
    try:
        urllib.request.urlopen(check_req)
        method = 'PUT'
        url = f'{API_URL}/{slug}'
    except Exception:
        method = 'POST'
        url = API_URL

    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(url, data=data,
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': f'Bearer {token}'})
    req.method = method
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f'OK  {method} {slug}: {title}')
    except Exception as e:
        print(f'ERR {method} {slug}: {e}')

print('Done')
