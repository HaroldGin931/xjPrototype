import { initialState, perform, startEvent, names } from './model.mjs';

let state = initialState();
const preview = new URLSearchParams(location.search);
let actor = preview.get('actor') === 'guest' ? '' : ['admin', 'lin', 'chen'].includes(preview.get('actor')) ? preview.get('actor') : 'lin';
let searchQuery = '';
const composeDrafts = {};
let currentDetail = null;
const detailStack = [];
const myTaskFilters = {};
let myTaskFilter = 'pending';
let searchOrigin = 'plaza';
let taskListFilter = 'all';
let nodeListFilter = 'all';
let eventNodeFilter = 'all';
const nodeFor = id => state.nodes.find(n => n.id === id);
const nodeRef = id => `node:${id}`;
let toastTimer;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
const displayName = user => state.profiles[user]?.name || names[user];
const admin = () => actor === 'admin';
const itemFor = id => [...state.tasks, ...state.events, ...state.posts].find(item => item.id === id);
const page = () => location.hash.slice(1) || 'plaza';
const labels = { draft: '草稿', open: '接受申请', in_progress: '执行中', under_review: '待验收', completed: '已完成', ended: '已结束', started: '进行中', cancelled: '已取消', pending: '待审批', approved: '已通过', rejected: '未通过', removed: '已移除', closed: '已关闭', appointed: '已选定', not_selected: '未选中', submitted: '待验收', returned: '待修改', member: '社区成员' };
const badge = (status, label = labels[status] || status) => `<span class="status ${['pending', 'under_review', 'returned'].includes(status) ? 'review' : ['completed', 'ended', 'approved'].includes(status) ? 'done' : ['cancelled', 'closed', 'removed', 'rejected', 'not_selected'].includes(status) ? 'closed' : ''}">${esc(label)}</span>`;
function button(text, action, data = {}, style = 'primary') {
  return `<button type="button" class="button ${style}" data-action="${action}" ${Object.entries(data).map(([key, value]) => `data-${key.replace(/[A-Z]/g, x => '-' + x.toLowerCase())}="${esc(value)}"`).join(' ')}>${esc(text)}</button>`;
}
const empty = (title, copy = '') => `<div class="empty"><h3>${title}</h3>${copy ? `<p>${copy}</p>` : ''}</div>`;
const info = (copy, warm = false) => `<div class="information${warm ? ' warm' : ''}">${copy}</div>`;
function showToast(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3600); }
function history(items) {
  return `<details class="disclosure"><summary>查看进展</summary><ol class="timeline">${[...items].reverse().map(h => `<li><time>${esc(h.time)}</time><div><strong>${esc(h.text)}</strong>${h.receipt ? `<details class="receipt-reference"><summary>查看凭证</summary><small>凭证编号 ${esc(h.receipt)}</small></details>` : ''}</div></li>`).join('')}</ol></details>`;
}
function canApplyTask(task) {
  return Boolean(actor) && !admin() && task.status === 'open' && !task.applications.some(a => a.user === actor);
}
function visibleTasks(items) {
  return items.filter(t => taskListFilter === 'all' || (taskListFilter === 'available' ? canApplyTask(t) : t.nodeId === taskListFilter));
}
function card(item) {
  const node = nodeFor(item.nodeId);
  const status = item.status === 'open' ? '招募中' : labels[item.status];
  return `<article class="task-card-v13"><button class="task-publisher" data-action="community" data-id="${node.id}"><span class="task-community-avatar" aria-hidden="true">${esc(node.name.slice(0,1))}</span><span><strong>${esc(node.name)}</strong><small>${esc(item.history[0]?.time || '')} · ${item.status === 'draft' ? '草稿' : '发布'}</small></span></button><button class="task-card-content" data-action="detail" data-id="${item.id}"><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><div class="task-card-footer"><span class="task-state task-state-${item.status}">${status}</span><strong class="task-rice" aria-label="报酬 ${item.reward} 稻米"><img src="./assets/sprout.svg" width="24" height="24" alt="">${item.reward}</strong></div></button></article>`;
}
function editProfileButton() {
  return '<button type="button" class="profile-edit-link" data-action="edit-profile" aria-label="编辑资料" title="编辑资料"><img src="./assets/pencil.svg" width="20" height="20" alt=""></button>';
}
function publicProfile(user) {
  const profile = state.profiles[user];
  return `<section class="social-profile-card" aria-label="个人资料">${actor === user ? editProfileButton() : ''}<div class="social-profile-avatar" aria-hidden="true">${esc(displayName(user).slice(0, 1))}</div><h1>${esc(displayName(user))}</h1><p class="profile-identity-v13">${esc(profile.handle)}</p><p class="social-profile-description">${esc(profile.bio)}</p></section><h2 class="search-section-title">帖子</h2><div class="post-stream">${state.posts.filter(p => p.user === user).map(postCard).join('') || empty('还没有公开帖子')}</div>`;
}
function profilePage() {
  const account = state.accounts[actor];
  const profile = state.profiles[actor];
  const joined = state.nodes.filter(n => n.members[actor] === 'member').length;
  const pending = state.nodes.filter(n => n.members[actor] === 'pending').length;
  const communityCopy = `已加入 ${joined} · 申请中 ${pending}`;
  const menus = [['community-identities','社区身份',communityCopy],['my-tasks','我的任务',admin() ? '待审批 · 进行中 · 审核中 · 已结束' : '申请中 · 进行中 · 审核中 · 已结束'],['my-events','我的活动','我申请／主办的活动'],['my-posts','我的帖子','在广场发布过的内容'],['alliance','联盟与治理','浏览联盟中的社区节点']];
  return `<section class="profile-hero-v13" aria-label="个人资料">${editProfileButton()}<button class="profile-avatar-v13" data-action="author" data-user="${actor}" aria-label="查看${esc(displayName(actor))}的主页">${esc(displayName(actor).slice(0,1))}</button><h2>${esc(displayName(actor))}</h2><p class="profile-identity-v13">${esc(profile.handle)}</p><p class="profile-bio-v13">${esc(profile.bio)}</p>${button('查看主页', 'author', {user:actor}, 'secondary small')}</section><button class="rice-summary-v13" data-action="wallet" aria-label="查看测试稻米流水"><span class="rice-top-v13"><span><span class="caption">我的测试稻米</span><strong>${account.balance + account.frozen}</strong></span><span class="rice-history-link">查看流水 →</span></span><span class="rice-grid-v13"><span><b>${account.balance}</b><small>可用</small></span><span><b>${account.frozen}</b><small>冻结</small></span><span><b>${account.totalEarned}</b><small>累计获得</small></span></span></button><section class="profile-menu-v13" aria-label="我的记录">${menus.map(([action,title,copy]) => `<button class="profile-menu-row" data-action="${action}"><span><strong>${title}</strong><small>${copy}</small></span><span class="menu-arrow" aria-hidden="true">→</span></button>`).join('')}</section><div class="logout-button">${button('退出登录', 'logout', {}, 'quiet')}</div>`;
}
function tasksPage(items) {
  const filtered = visibleTasks(items);
  const options = [['all','全部'], ['available','可申请'], ...state.nodes.map(n => [n.id,n.name])];
  return `<section class="task-hero-v13"><span class="hero-eyebrow">TASKS · COMMUNITY COLLABORATION</span><h2>一起把事情<br>真正做完</h2><p>申请、交付、验收与稻米结算，任务进展都在这里。</p>${button('我的任务','my-tasks',{},'hero-action')}</section><div class="task-browse-heading"><h2>全部任务</h2><div class="task-filter-row"><label class="sr-only" for="task-community-filter">筛选任务</label><select id="task-community-filter">${options.map(([value,label]) => `<option value="${value}"${taskListFilter === value ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select></div></div><section class="task-list-v13" aria-label="任务列表">${filtered.length ? filtered.map(card).join('') : empty(taskListFilter === 'available' ? '暂无可申请的任务' : '暂无符合筛选条件的任务')}</section>`;
}
function render() {
  const clockEvents = state.events.filter(event => event.status === 'open');
  const selectedEvent = $('clock-event').value;
  $('clock-event').innerHTML = clockEvents.map(event => `<option value="${event.id}">${esc(event.title)}</option>`).join('') || '<option value="">没有正在报名的活动</option>';
  if (clockEvents.some(event => event.id === selectedEvent)) $('clock-event').value = selectedEvent;
  $('clock-event').disabled = !clockEvents.length;
  $('clock-start').disabled = !clockEvents.length;
  document.querySelector('.topbar-actions').hidden = false;
  document.querySelector('.bottom-nav').hidden = false;
  for (const a of document.querySelectorAll('.bottom-nav a')) {
    if (a.dataset.page === page()) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  $('header-compose').hidden = page() === 'me';
  if (!actor) { $('notification-dot').hidden = true; $('notification-link').setAttribute('aria-label', '通知'); }
  if (!actor && ['me', 'notifications'].includes(page())) {
    $('home-brand').hidden = false;
    $('section-title').hidden = true;
    $('main').innerHTML = `<section class="signed-out-state"><h1>欢迎回来</h1><p class="muted">选择一个演示身份继续体验。</p><form id="login-form" class="demo-login-form"><label for="login-actor">演示身份</label><select id="login-actor" name="actor">${Object.keys(names).map(user => `<option value="${user}">${esc(displayName(user))}${user === 'admin' ? ' · 管理员' : ' · 参与者'}</option>`).join('')}</select><button class="button primary" type="submit">进入应用</button></form></section>`;
    return;
  }
  for (const option of $('actor').options) if (option.value) option.textContent = `${displayName(option.value)}${option.value === 'admin' ? ' · 管理员' : ' · 参与者'}`;
  const section = ['tasks', 'me'].includes(page());
  document.body.dataset.page = page();
  $('home-brand').hidden = section;
  $('section-title').hidden = !section;
  $('section-title').textContent = page() === 'me' ? '我的' : '任务';
  const notes = state.notifications.filter(n => n.targets.includes(actor));
  const hasUnread = notes.some(n => !n.readBy.includes(actor));
  $('notification-dot').hidden = !hasUnread;
  $('notification-link').setAttribute('aria-label', hasUnread ? '通知，有未读消息' : '通知');
  if (page() === 'notifications') $('notification-link').setAttribute('aria-current', 'page'); else $('notification-link').removeAttribute('aria-current');
  if (page() === 'plaza') {
    $('main').innerHTML = `<h1 class="sr-only">广场</h1><section class="post-stream" aria-label="广场帖子流">${state.posts.map(postCard).join('') || empty('还没有发布帖子')}</section>`;
  } else if (page() === 'events') {
    const events = state.events.filter(e => (admin() || e.status !== 'draft') && (eventNodeFilter === 'all' || e.nodeId === eventNodeFilter));
    $('main').innerHTML = `<div class="page-heading"><h1>${eventNodeFilter === 'all' ? '活动' : esc(nodeFor(eventNodeFilter).name) + '的活动'}</h1>${eventNodeFilter === 'all' ? button('我的活动', 'my-events', {}, 'quiet small') : button('全部活动', 'browse', {kind:'event'}, 'quiet small')}</div><section class="post-stream" aria-label="社区活动">${events.map(eventCard).join('') || empty('还没有发布活动')}</section>`;
  } else if (page() === 'me') {
    $('main').innerHTML = profilePage();
  } else if (page() === 'notifications') {
    $('main').innerHTML = `<div class="page-heading"><div><h1>通知</h1><p class="muted">申请与协作的最新进展。</p></div>${notes.length ? button('全部已读', 'read-notifications', {}, 'quiet small') : ''}</div><div class="list">${notes.length ? notes.map(n => `<button class="notification" data-action="notice" data-id="${n.id}"><div class="candidate-heading"><h3>${esc(n.title)}</h3>${!n.readBy.includes(actor) ? '<span class="status review">未读</span>' : ''}</div><p>${esc(n.body)}</p><time>${esc(n.time)}</time></button>`).join('') : empty('暂时没有新通知', '申请或任务有进展时，会出现在这里。')}</div>`;
  } else if (page() === 'search') {
    $('main').innerHTML = `<button class="search-back" data-action="search-back">← 返回${searchOrigin === 'tasks' ? '任务' : searchOrigin === 'me' ? '我的' : '广场'}</button><div class="page-heading"><h1>搜索</h1></div><label class="sr-only" for="global-search">搜索帖子、任务和社区</label><input id="global-search" class="search-box" type="search" placeholder="搜索帖子、任务、社区" value="${esc(searchQuery)}"><div id="search-results">${searchResults()}</div>`;
  } else if (page() === 'communities') {
    $('main').innerHTML = nodeDirectory();
  } else {
    const items = state.tasks.filter(i => admin() || i.status !== 'draft');
    $('main').innerHTML = tasksPage(items);
  }
  if (currentDetail && $('detail').open) renderDetail();
}
function authorHeader(post) {
  return `<button class="post-author" data-action="author" data-user="${post.user}" aria-label="查看${esc(post.author)}的主页"><span class="post-avatar" aria-hidden="true">${esc(post.author.slice(0, 1))}</span><span class="post-author-copy"><strong>${esc(post.author)}</strong><span class="post-time">青禾社区 · ${esc(post.time)}</span></span></button>`;
}
function postActions(post) {
  const liked = post.likedBy.includes(actor);
  return `<div class="post-interactions"><button data-action="detail" data-id="${post.id}" aria-label="查看 ${post.comments.length} 条评论">${post.comments.length} 条评论</button><button data-action="post-like" data-id="${post.id}" aria-pressed="${liked}">${liked ? '已赞' : '赞'} ${post.likes}</button></div>`;
}
function postCard(post) {
  return `<article class="post-card">${authorHeader(post)}<button class="post-content" data-action="detail" data-id="${post.id}">${post.title ? `<h2>${esc(post.title)}</h2>` : ''}<p>${esc(post.text)}</p></button>${post.tag ? `<button class="post-topic" data-action="topic" data-tag="${esc(post.tag)}">#${esc(post.tag)}</button>` : ''}${postActions(post)}</article>`;
}
function eventCard(event) {
  const status = event.status === 'open' ? '报名中' : labels[event.status];
  return `<button class="post-card event-feed-card" data-action="detail" data-id="${event.id}"><span class="event-feed-label">社区活动</span><h2>${esc(event.title)}</h2><p class="event-feed-meta">${esc(event.date)} · ${esc(event.location)}</p><div class="event-feed-bottom"><span class="task-state task-state-${event.status === 'ended' ? 'completed' : event.status === 'started' ? 'in_progress' : event.status}">${status}</span>${event.fee ? `<strong class="task-rice" aria-label="报名费每人 ${event.fee} 稻米"><img src="./assets/sprout.svg" width="24" height="24" alt="">${event.fee}<small>/ 人</small></strong>` : '<strong>免费</strong>'}</div></button>`;
}
function postDetail(post) {
  return `${authorHeader(post)}${post.title ? `<h1 class="post-detail-title">${esc(post.title)}</h1>` : ''}<p class="description post-detail-text">${esc(post.text)}</p>${post.tag ? `<p class="post-topic">#${esc(post.tag)}</p>` : ''}${postActions(post)}<section class="detail-section"><h3>评论 · ${post.comments.length}</h3>${actor ? `<form id="comment-form" data-id="${post.id}" class="comment-form"><label class="sr-only" for="comment-input">写下你的评论</label><textarea id="comment-input" name="comment" required placeholder="写下你的评论…"></textarea><div class="single-action"><button type="submit" class="button primary">发表评论</button></div></form>` : `<div class="single-action">${button('登录后评论', 'login', {}, 'secondary')}</div>`}${post.comments.map(c => `<div class="candidate"><div class="candidate-heading"><strong>${esc(displayName(c.user))}</strong><span class="fine">${esc(c.time)}</span></div><p class="description">${esc(c.text)}</p></div>`).join('')}</section>`;
}
function searchResults() {
  const q = searchQuery.trim().toLowerCase(); if (!q) return info('输入关键词，查找帖子、任务或社区。');
  const posts = state.posts.filter(p => `${p.title} ${p.text} ${p.tag} ${p.author}`.toLowerCase().includes(q));
  const events = state.events.filter(e => e.status !== 'draft' && `${e.title} ${e.description} ${e.location}`.toLowerCase().includes(q));
  const tasks = state.tasks.filter(t => (admin() || t.status !== 'draft') && `${t.title} ${t.description}`.toLowerCase().includes(q));
  const communities = state.nodes.filter(n => `${n.name} ${n.description} ${n.handle || ''}`.toLowerCase().includes(q));
  return `<section><h2 class="search-section-title">帖子与活动 · ${posts.length + events.length}</h2><div class="post-stream">${posts.map(postCard).join('') + events.map(eventCard).join('') || '<p class="caption">没有相关内容</p>'}</div></section><section><h2 class="search-section-title">任务 · ${tasks.length}</h2><div class="list">${tasks.map(card).join('') || '<p class="caption">没有相关任务</p>'}</div></section><section><h2 class="search-section-title">社区 · ${communities.length}</h2><div class="node-list">${communities.map(communityCard).join('') || '<p class="caption">没有相关社区</p>'}</div></section>`;
}
function communityCard(node) {
  const status = node.members[actor];
  const relation = status === 'member' ? '已加入' : status === 'pending' ? '申请中' : '';
  return `<button class="node-card" data-action="community" data-id="${node.id}"><span class="node-card-heading"><span class="task-community-avatar" aria-hidden="true">${esc(node.name.slice(0,1))}</span><span class="node-card-name"><strong>${esc(node.name)}</strong>${node.handle ? `<small>${esc(node.handle)}</small>` : ''}</span><span class="menu-arrow" aria-hidden="true">→</span></span><span class="node-card-copy">${esc(node.description)}</span><span class="node-card-footer"><span>${Object.values(node.members).filter(v => v === 'member').length} 位成员</span>${relation ? `<span class="status">${relation}</span>` : ''}</span></button>`;
}
function nodeDirectory() {
  const groups = [['all','全部节点'], ['member','已加入'], ['pending','申请中']];
  const nodes = state.nodes.filter(n => nodeListFilter === 'all' || n.members[actor] === nodeListFilter);
  return `<h1 class="detail-title">节点目录</h1><div class="my-task-tabs" role="group" aria-label="节点列表">${groups.map(([key,label]) => `<button class="tab" type="button" aria-pressed="${nodeListFilter === key}" data-action="node-filter" data-filter="${key}">${label}<span class="task-filter-count">${state.nodes.filter(n => key === 'all' || n.members[actor] === key).length}</span></button>`).join('')}</div><div class="node-list">${nodes.map(communityCard).join('') || empty(nodeListFilter === 'member' ? '还没有加入节点' : '还没有等待审批的加入申请')}</div>`;
}
function communityIdentities() {
  return `<h1 class="detail-title">社区身份</h1>${[['member','已加入'],['pending','申请中']].map(([status,title]) => {
    const nodes = state.nodes.filter(n => n.members[actor] === status);
    if (status === 'pending' && !nodes.length) return '';
    return `${status === 'pending' ? `<h2 class="search-section-title">${title} · ${nodes.length}</h2>` : ''}<div class="node-list">${nodes.map(node => `<button class="node-card" data-action="community" data-id="${node.id}"><span class="node-card-heading"><span class="task-community-avatar" aria-hidden="true">${esc(node.name.slice(0,1))}</span><span class="node-card-name"><strong>${esc(node.name)}</strong><small>${status === 'pending' ? '申请中 · 等待管理员审批' : admin() ? '社区管理员' : '正式成员'}</small></span><span class="menu-arrow" aria-hidden="true">→</span></span></button>`).join('') || empty('还没有加入社区', '可以前往联盟与治理，浏览节点并申请加入。')}</div>`;
  }).join('')}`;
}
function allianceDetail() {
  return `<h1 class="detail-title">联盟与治理</h1><p class="muted">认识联盟中的社区，找到你想参与的地方。</p><section class="detail-section"><div class="profile-menu-v13"><button class="profile-menu-row" data-action="node-directory"><span><strong>节点目录</strong><small>浏览社区介绍，申请加入节点</small></span><span class="menu-arrow" aria-hidden="true">→</span></button></div></section>`;
}
function openDetail(ref) {
  if (!actor && ['community-identities', 'wallet', 'my-posts', 'my-tasks', 'my-events'].includes(ref)) { requestLogin(); return; }
  if (currentDetail && $('detail').open && currentDetail !== ref) detailStack.push({ref:currentDetail, scroll:$('detail').scrollTop, filter:myTaskFilter, nodeFilter:nodeListFilter});
  if (ref === 'my-tasks') {
    const own = ownTasks();
    myTaskFilter = myTaskFilters[actor] || ['pending', 'active', 'review', 'recruiting', 'ended', 'draft'].find(bucket => own.some(t => taskBucket(t) === bucket)) || 'pending';
  }
  currentDetail = ref; renderDetail(); if (!$('detail').open) $('detail').showModal(); $('detail').scrollTop = 0;
}
function backDetail() {
  const previous = detailStack.pop();
  if (!previous) { closeDetail(); return; }
  currentDetail = previous.ref; myTaskFilter = previous.filter; nodeListFilter = previous.nodeFilter;
  renderDetail(); $('detail').scrollTop = previous.scroll;
}
function ownTasks() { return state.tasks.filter(t => admin() || t.applications.some(a => a.user === actor)); }
function taskBucket(task) {
  if (admin()) {
    if (task.status === 'draft') return 'draft';
    if (task.status === 'open') return task.applications.some(a => a.status === 'pending') ? 'pending' : 'recruiting';
    return task.status === 'under_review' ? 'review' : task.status === 'in_progress' ? 'active' : 'ended';
  }
  const application = task.applications.find(a => a.user === actor);
  if (application?.status === 'pending' && task.status === 'open') return 'pending';
  if (task.assignee === actor && task.status === 'under_review') return 'review';
  if (task.assignee === actor && task.status === 'in_progress') return 'active';
  return 'ended';
}
function myTasksDetail() {
  const tasks = ownTasks();
  const groups = [[ 'pending', admin() ? '待审批' : '申请中' ], [ 'active', '进行中' ], [ 'review', '审核中' ], [ 'ended', '已结束' ], ...(admin() ? [[ 'recruiting', '招募中' ], [ 'draft', '草稿' ]] : [])];
  if (!groups.some(([key]) => key === myTaskFilter)) myTaskFilter = 'pending';
  const filtered = tasks.filter(t => taskBucket(t) === myTaskFilter);
  const emptyCopy = { pending: admin() ? '还没有需要审批的任务申请' : '还没有等待选定的申请', active: '还没有进行中的任务', review: '还没有等待验收的成果', ended: '还没有已结束的任务记录', recruiting: '还没有等待申请的任务', draft: '还没有任务草稿' };
  return `<h1 class="detail-title">${admin() ? '我发布的任务' : '我的任务'}</h1><div class="my-task-tabs" role="group" aria-label="我的任务状态">${groups.map(([key,label]) => `<button type="button" class="tab" aria-pressed="${myTaskFilter === key}" data-action="my-task-filter" data-filter="${key}">${label}<span class="task-filter-count">${tasks.filter(t => taskBucket(t) === key).length}</span></button>`).join('')}</div><div class="my-task-list">${filtered.length ? filtered.map(t => {
    const application = t.applications.find(a => a.user === actor);
    const shownStatus = !admin() && application?.status === 'not_selected' ? 'not_selected'
      : !admin() && taskBucket(t) === 'pending' ? '待选定'
      : t.status === 'in_progress' && t.submissions.at(-1)?.status === 'returned' ? 'returned' : t.status;
    return `<button type="button" class="my-task-row" data-action="detail" data-id="${t.id}"><span class="my-task-row-heading"><strong>${esc(t.title)}</strong>${badge(shownStatus)}</span><span class="my-task-row-meta">${esc(nodeFor(t.nodeId).name)} · ${t.reward} 稻米${t.assignee ? ` · ${esc(displayName(t.assignee))}承接` : ''}</span></button>`;
  }).join('') : empty(emptyCopy[myTaskFilter])}</div>`;
}
function closeDetail() { detailStack.length = 0; currentDetail = null; $('detail').close(); }
function detailFrame(title, body) { return `<header class="detail-header"><span>${title}</span><div class="detail-tools"><label class="sr-only" for="detail-actor">切换演示身份</label><select id="detail-actor" class="detail-actor">${Object.keys(names).map(u => `<option value="${u}"${u === actor ? ' selected' : ''}>${esc(displayName(u))}${u === 'admin' ? ' · 管理员' : ''}</option>`).join('')}</select><button class="close-button" data-action="close-detail" autofocus>${detailStack.length ? '返回' : '关闭'}</button></div></header><div class="detail-body">${body}</div>`; }
function renderDetail() {
  const scroll = $('detail').scrollTop;
  let content;
  if (currentDetail === 'node-directory') content = detailFrame('节点目录', nodeDirectory());
  else if (currentDetail === 'community-identities') content = detailFrame('社区身份', communityIdentities());
  else if (currentDetail === 'alliance') content = detailFrame('联盟与治理', allianceDetail());
  else if (currentDetail === 'community' || currentDetail.startsWith('node:')) content = detailFrame('节点详情', communityDetail(currentDetail === 'community' ? 'qinghe' : currentDetail.slice(5)));
  else if (currentDetail === 'wallet') content = detailFrame('稻米记录', walletDetail());
  else if (currentDetail === 'my-posts') content = detailFrame('我的帖子', `<div class="post-stream">${state.posts.filter(p => p.user === actor).map(postCard).join('') || empty('还没有发布帖子')}</div>`);
  else if (currentDetail.startsWith('author:')) content = detailFrame('个人主页', publicProfile(currentDetail.split(':')[1]));
  else if (currentDetail === 'my-tasks') content = detailFrame('任务记录', myTasksDetail());
  else if (currentDetail === 'my-events') {
    const items = state.events.filter(i => admin() || i.applications.some(a => a.user === actor));
    content = detailFrame(admin() ? '我发布的' : '我申请的', `<h1 class="detail-title">我的活动</h1><div class="list">${items.length ? items.map(eventCard).join('') : empty('还没有相关记录', '去看看社区里有哪些可以参与的事。')}</div>`);
  } else if (currentDetail === 'post' || currentDetail.startsWith('post-')) content = detailFrame('帖子详情', postDetail(state.posts.find(p => p.id === (currentDetail === 'post' ? 'post-1' : currentDetail))));
  else { const item = itemFor(currentDetail); if (!item || (item.status === 'draft' && !admin())) { closeDetail(); return; } content = detailFrame(item.id.startsWith('task') ? '任务详情' : '活动详情', item.id.startsWith('task') ? taskDetail(item) : eventDetail(item)); }
  $('detail-content').innerHTML = content;
  $('detail').scrollTop = scroll;
}
function taskDetail(t) {
  const mine = t.applications.find(a => a.user === actor);
  let callout = '';
  if (t.status === 'draft') callout = `${info('草稿仅管理员可见。发布时冻结任务报酬。')}<div class="single-action">${button('继续编辑', 'publish-form', { kind: 'task', id: t.id })}</div>`;
  else if (t.status === 'open' && !admin()) callout = mine ? info('你已申请，等待发布者选择承接者。') : `<div class="single-action">${button(actor ? '申请承接' : '登录后申请', 'apply-form', { id: t.id })}</div>`;
  else if (t.status === 'in_progress' && t.assignee === actor) callout = `${info('你是本任务的承接者。完成后提交最终成果。')}<div class="single-action">${button('提交成果', 'submit-form', { id: t.id })}</div>`;
  else if (t.status === 'under_review') callout = info(admin() ? '成果已提交。验收通过时，会同时发放报酬。' : '成果等待发布者验收，报酬继续冻结。');
  else if (t.status === 'completed') callout = info(`验收已通过，${t.reward} 稻米已发放给${esc(displayName(t.assignee))}。`);
  else if (mine?.status === 'not_selected') callout = info('这次任务已有其他承接者，你可以看看其他任务。');
  else if (t.status === 'cancelled') callout = info('任务已取消，冻结的报酬已退回社区资金池。');
  const applications = admin() ? `<section class="detail-section"><h3>申请者 · ${t.applications.length} 人</h3>${t.applications.length ? t.applications.map(a => `<div class="candidate"><div class="candidate-heading"><strong>${esc(displayName(a.user))}</strong>${badge(a.status)}</div><p>${esc(a.reason)}</p>${t.status === 'open' && a.status === 'pending' ? `<div class="candidate-actions">${button('选为承接者', 'confirm', { command: 'task-appoint', id: t.id, candidate: a.user }, 'primary small')}</div>` : ''}</div>`).join('') : '<p class="muted">还没有人申请。</p>'}</section>` : '';
  const submissions = (admin() || t.assignee === actor) && t.submissions.length ? `<section class="detail-section"><h3>交付成果</h3>${[...t.submissions].reverse().map((s, index) => `<div class="candidate"><div class="candidate-heading"><strong>${esc(displayName(t.assignee))} · ${esc(s.time)}</strong>${badge(s.status)}</div><p class="description">${esc(s.text)}</p>${s.feedback ? info(`修改意见：${esc(s.feedback)}`, true) : ''}${index === 0 && admin() && t.status === 'under_review' ? `<div class="actions safe-actions">${button('退回修改', 'return-form', { id: t.id }, 'secondary')}${button('验收通过并发放', 'confirm', { command: 'task-approve', id: t.id })}</div>` : ''}</div>`).join('')}</section>` : '';
  return `${badge(t.status === 'open' ? '招募中' : t.status)}<h1 class="detail-title">${esc(t.title)}</h1><p class="detail-byline">青禾社区 · 周禾发布${t.assignee ? ` · ${esc(displayName(t.assignee))}承接` : ''}</p>
    <div class="money-bar"><div><strong>${t.reward}</strong> 稻米<small>任务报酬</small></div><div class="money-label">${t.status === 'draft' ? '发布时冻结' : t.status === 'completed' ? '已发放' : t.status === 'cancelled' ? '已解冻' : '报酬已冻结'}<br>社区资金池</div></div>${callout}
    ${submissions}<section class="detail-section"><h3>要做什么</h3><p class="description">${esc(t.description)}</p></section><section class="detail-section"><h3>交付要求</h3><p class="description">${esc(t.requirement)}</p></section>${applications}${history(t.history)}
    ${admin() && ['open', 'draft'].includes(t.status) ? `<div class="danger-section"><p>选定承接者前，可以取消任务。</p>${button('取消任务', 'confirm', { command: 'task-cancel', id: t.id }, 'danger small')}</div>` : ''}`;
}
function eventDetail(e) {
  const mine = e.applications.find(a => a.user === actor);
  const approved = e.applications.filter(a => ['approved', 'completed'].includes(a.status)).length;
  let cta = '';
  if (e.status === 'draft') cta = `<div class="single-action">${button('继续编辑', 'publish-form', { kind: 'event', id: e.id })}</div>`;
  else if (e.status === 'open' && !admin()) {
    if (!mine) cta = `${info(e.fee ? `申请时冻结 ${e.fee} 稻米，由主办方筛选参加人选。活动开始时，未入选的费用自动退回。` : '提交参与说明，由主办方筛选参加人选。')}<div class="single-action">${button(actor ? '申请参加' : '登录后申请', 'apply-form', { id: e.id })}</div>`;
    else { const text = { pending: `申请已提交，等待主办方审批。${e.fee ? `${e.fee} 稻米已冻结。` : ''}`, approved: `申请已通过，期待见面。${e.fee ? '活动结束时，报名费将转给主办方。' : ''}`, rejected: `本次申请未通过。${e.fee ? '冻结费用已退回。' : ''}`, removed: `本次报名已被主办方移除。${e.fee ? '冻结费用已退回。' : ''}` }; cta = info(text[mine.status] || '申请已关闭。'); }
  } else if (e.status === 'started') {
    const outcome = mine?.status === 'not_selected' ? `本次未入选。${e.fee ? '冻结费用已退回。' : ''}`
      : mine?.status === 'approved' ? `你已获得参加资格。${e.fee ? '报名费继续冻结，活动结束后结算。' : ''}`
      : mine?.status === 'removed' || mine?.status === 'rejected' ? `本次报名已结束。${e.fee ? '冻结费用已退回。' : ''}` : '';
    cta = info(`活动进行中，报名审批已结束。${outcome}`);
  } else if (e.status === 'ended') cta = info(e.fee ? '活动已结束。已通过的报名完成结算，未入选的冻结费用已退回。' : '活动已结束，报名记录已更新。');
  else if (e.status === 'cancelled') cta = info(e.fee ? '活动已取消，冻结的报名费用已全部退回。' : '活动已取消，申请已关闭。');
  const candidates = admin() ? `<section class="detail-section"><h3>申请名单 · ${e.applications.length} 人</h3>${e.applications.length ? e.applications.map(a => `<div class="candidate"><div class="candidate-heading"><strong>${esc(displayName(a.user))}</strong>${badge(a.status, a.status === 'not_selected' ? '未入选' : undefined)}</div><p>${esc(a.reason)}</p>${e.status === 'open' && a.status === 'pending' ? `<div class="candidate-actions">${button('拒绝申请', 'confirm', { command: 'event-reject', id: e.id, candidate: a.user }, 'secondary small')}${button('通过申请', 'execute', { command: 'event-approve', id: e.id, candidate: a.user }, 'primary small')}</div>` : ['open', 'started'].includes(e.status) && a.status === 'approved' ? `<div class="candidate-actions">${button('移除报名', 'confirm', { command: 'event-remove', id: e.id, candidate: a.user }, 'danger small')}</div>` : ''}</div>`).join('') : '<p class="muted">还没有人申请。</p>'}</section>` : mine ? `<section class="detail-section"><h3>我的申请</h3><div class="candidate-heading"><strong>${esc(displayName(actor))}</strong>${badge(mine.status, mine.status === 'not_selected' ? '未入选' : undefined)}</div><p class="description muted" style="margin-top:14px">${esc(mine.reason)}</p></section>` : '';
  return `${badge(e.status === 'open' ? '报名中' : e.status)}<h1 class="detail-title">${esc(e.title)}</h1><p class="detail-byline">青禾社区 · 周禾发起</p><div class="money-bar"><div><span class="amount-line"><strong>${e.fee || '免费'}</strong>${e.fee ? ' 稻米' : ''}</span><small>${e.fee ? '每人报名费' : '报名费用'}</small></div><div class="money-label">${e.fee ? '申请时冻结<br>活动结束后结算' : '不收取报名费'}</div></div>
    <p>${esc(e.date)}</p><p class="muted">${esc(e.location)}</p><div class="count-row"><div><strong>${e.applications.length} 人</strong><span>已提交申请</span></div><div><strong>${approved} / ${e.capacity} 人</strong><span>已通过 / 上限</span></div></div><div style="margin-top:24px">${cta}</div><section class="detail-section"><h3>活动介绍</h3><p class="description">${esc(e.description)}</p></section>${candidates}${history(e.history)}
    ${admin() && e.status === 'started' ? `<div class="safe-actions"><p class="caption" style="margin-bottom:18px">活动实际结束后，由你确认结算。</p>${button('确认活动结束', 'confirm', { command: 'event-finish', id: e.id }, 'primary full')}</div>` : ''}${admin() && ['open', 'started'].includes(e.status) ? `<div class="danger-section"><p>取消后，所有仍冻结的报名费会退回。</p>${button('取消活动', 'confirm', { command: 'event-cancel', id: e.id }, 'danger small')}</div>` : ''}`;
}
function communityDetail(nodeId) {
  const node = nodeFor(nodeId);
  if (!node) return empty('没有找到这个节点');
  const members = Object.keys(node.members).filter(u => node.members[u] === 'member');
  const pending = Object.keys(node.members).filter(u => node.members[u] === 'pending');
  return `<span class="eyebrow">社区节点</span><h1 class="detail-title">${esc(node.name)}</h1>${node.handle ? `<p class="node-handle">${esc(node.handle)}</p>` : ''}<p class="description">${esc(node.description)}</p><section class="detail-section"><h3>社区成员 · ${members.length} 人</h3><p>${members.map(u => `${esc(displayName(u))}${u === 'admin' ? '（管理员）' : ''}`).join('、')}</p></section>
    ${admin() ? `<section class="detail-section"><h3>加入申请 · ${pending.length} 人</h3>${pending.length ? pending.map(u => `<div class="candidate"><strong>${esc(displayName(u))}</strong><p>申请加入${esc(node.name)}。</p><div class="candidate-actions">${button('拒绝', 'member-review', { nodeId, candidate: u, approve: 'false' }, 'secondary small')}${button('通过', 'member-review', { nodeId, candidate: u, approve: 'true' }, 'primary small')}</div></div>`).join('') : '<p class="muted">没有待处理的申请。</p>'}</section>` : `<div class="safe-actions">${node.members[actor] === 'member' ? info('你已经是该社区的成员。') : node.members[actor] === 'pending' ? info('加入申请已提交，等待管理员审批。') : `${node.members[actor] === 'rejected' ? '<p class="caption" style="margin-bottom:18px">上次申请未通过，可以重新申请。</p>' : ''}${button(actor ? '申请加入社区' : '登录后加入', 'community-apply', { nodeId }, 'primary full')}`}</div>`}
    <section class="detail-section"><h3>公开参与</h3><p class="muted" style="margin-bottom:20px">无论是否加入社区，都可以申请这里的任务和活动。</p><div class="actions">${button('社区任务', 'browse', { kind: 'task', nodeId }, 'secondary')}${button('社区活动', 'browse', { kind: 'event', nodeId }, 'secondary')}</div></section>${node.history.length ? history(node.history) : ''}`;
}
function walletDetail() {
  const account = state.accounts[actor]; const rows = state.ledger.filter(r => r.user === actor);
  return `<h1 class="detail-title">${admin() ? '社区资金池' : '我的稻米'}</h1><p class="muted">测试稻米</p><div class="balance-grid"><div><small>可用稻米</small><strong>${account.balance}</strong></div><div><small>已冻结</small><strong>${account.frozen}</strong></div></div><section class="detail-section"><h3>稻米明细</h3>${rows.length ? rows.map(r => `<div class="receipt"><div><strong>${esc(r.title)}</strong><small>${esc(r.time)} · ${r.kind}</small><details class="receipt-reference"><summary>查看凭证</summary><small>凭证编号 ${esc(r.id)}</small></details></div><div class="receipt-amount ${['收入', '解冻'].includes(r.kind) ? 'positive' : ''}">${['收入', '解冻'].includes(r.kind) ? '+' : '−'}${r.amount}<small style="display:block">稻米</small></div></div>`).join('') : '<p class="muted">还没有资金记录。</p>'}</section>`;
}
function requestLogin() { closeDetail(); location.hash = 'me'; render(); showToast('请先选择演示身份'); }
function editProfile() {
  if (!actor) { requestLogin(); return; }
  const profile = state.profiles[actor];
  actionForm('编辑资料', `<label>昵称<input name="name" value="${esc(displayName(actor))}" maxlength="64" required autocomplete="nickname"></label><label>简介<textarea name="bio" maxlength="512" rows="4">${esc(profile.bio)}</textarea></label><p class="caption">仅保存在当前演示页面，刷新后恢复示例资料。</p>`, 'profile-update', {}, '保存');
}
function setActor(user) {
  actor = Object.hasOwn(names, user) ? user : '';
  detailStack.length = 0;
  myTaskFilter = myTaskFilters[actor] || 'pending';
  $('actor').value = actor;
  $('action-dialog').close();
  if (!actor) closeDetail();
  render();
  showToast(actor ? `已切换为${displayName(actor)}` : '已退出演示身份');
}
function actionForm(title, fields, command, data = {}, submitText = '确认提交', extra = '', danger = false) {
  $('action-content').innerHTML = `<header class="detail-header"><span>确认操作</span><button class="close-button" data-action="close-action">关闭</button></header><form class="form" id="action-form" data-command="${command}" ${Object.entries(data).map(([k, v]) => `data-${k.replace(/[A-Z]/g, x => '-' + x.toLowerCase())}="${esc(v)}"`).join(' ')}><h2 class="form-title" id="action-title">${title}</h2>${fields}<p class="form-error" id="form-error" role="alert" hidden></p><div class="actions"><button type="button" class="button secondary" data-action="close-action">返回</button>${extra}<button type="submit" class="button ${danger ? 'danger' : 'primary'}">${submitText}</button></div></form>`;
  if (!$('action-dialog').open) $('action-dialog').showModal();
}
function publishForm(type, id) {
  const item = itemFor(id); const isTask = type === 'task';
  const fields = `<label>标题<input name="title" required maxlength="60" placeholder="用一句话说清楚要做什么" value="${esc(item?.title)}"></label><label>${isTask ? '任务说明' : '活动介绍'}<textarea name="description" required placeholder="写下具体内容，让参与者知道会做什么">${esc(item?.description)}</textarea></label>
    ${isTask ? `<label>交付要求<textarea name="requirement" required placeholder="完成后，需要提交什么成果？">${esc(item?.requirement)}</textarea></label>` : `<label>活动时间<input name="date" required placeholder="例如：9 月 20 日 14:00–16:00" value="${esc(item?.date)}"></label><label>活动地点<input name="location" required placeholder="例如：青禾公共客厅" value="${esc(item?.location)}"></label><label>通过人数上限<input name="capacity" type="number" min="1" max="10000" value="${item?.capacity || 8}" required><small>申请人数不限，审批通过时才占名额。</small></label>`}
    <label>${isTask ? '任务报酬' : '每人报名费'}（稻米）<input name="amount" type="number" min="0" max="1000000" step="1" value="${isTask ? item?.reward ?? 100 : item?.fee ?? 0}" required><small>${isTask ? `发布时从社区资金池冻结。当前可用 ${state.accounts.admin.balance} 稻米。` : '填 0 表示免费；收费活动在参与者申请时冻结。'}</small></label>`;
  actionForm(`${item ? '编辑' : '发布'}${isTask ? '任务' : '活动'}`, fields, 'publish', { kind: type, draftId: id || '' }, '确认发布', '<button type="submit" name="intent" value="draft" class="button secondary">保存草稿</button>');
}
function composeForm(type = 'post') {
  if (!admin()) type = 'post';
  const previous = $('action-form');
  if ($('action-dialog').open && previous?.dataset.kind) composeDrafts[`${actor}:${previous.dataset.kind}`] = { ...Object.fromEntries(new FormData(previous)), draftId: previous.dataset.draftId };
  if (type === 'post') actionForm('发布帖子', `<label>标题（选填）<input name="title" maxlength="80" placeholder="为这次分享取一个标题"></label><label>想分享什么<textarea name="text" required placeholder="分享社区里的见闻、想法或近况…"></textarea></label><label>话题（选填）<input name="tag" maxlength="24" placeholder="例如：驻地日志"></label>`, 'post-publish', { kind: 'post' }, '发布帖子');
  else publishForm(type, composeDrafts[`${actor}:${type}`]?.draftId);
  const form = $('action-form');
  const saved = composeDrafts[`${actor}:${type}`];
  if (saved) { for (const [key, value] of Object.entries(saved)) if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value; if (saved.draftId) form.dataset.draftId = saved.draftId; }
  if (admin()) form.insertAdjacentHTML('afterbegin', `<div class="compose-types" aria-label="发布类型">${[['post','帖子'],['event','活动'],['task','任务']].map(([value,label]) => `<button type="button" class="tab" aria-pressed="${value === type}" data-action="compose-type" data-kind="${value}">${label}</button>`).join('')}</div>`);
}
function confirmation(command, id, candidate) {
  const i = itemFor(id); const task = id.startsWith('task');
  let title, copy, submit = '确认'; let summary = ''; let danger = false;
  if (command === 'task-appoint') { title = `选定${esc(displayName(candidate))}？`; copy = '选定后，任务进入执行中，停止接受新申请。选定后不能更换承接者。'; submit = '确认选定'; }
  if (command === 'task-approve') { title = '验收通过并发放报酬'; copy = '确认成果符合交付要求后，冻结的报酬将直接发放，任务随即完成。'; submit = '通过并发放'; summary = `<div class="confirm-row"><span>收款人</span><strong>${esc(displayName(i.assignee))}</strong></div><div class="confirm-row"><span>发放金额</span><strong>${i.reward} 稻米</strong></div>`; }
  if (command === 'task-cancel') { title = '取消这个任务？'; copy = i.status === 'draft' ? '草稿未冻结资金，取消后不再发布。' : `取消后，${i.reward} 稻米会解冻回到社区资金池，申请同步关闭。`; submit = '确认取消任务'; danger = true; }
  if (command === 'event-reject' || command === 'event-remove') { title = `${command === 'event-reject' ? '拒绝' : '移除'}${esc(displayName(candidate))}的${command === 'event-reject' ? '申请' : '报名'}？`; copy = `${i.fee ? `${i.fee} 稻米会解冻回到${esc(displayName(candidate))}的可用余额。` : '这是一场免费活动。'}其他人的申请不受影响。`; submit = command === 'event-reject' ? '确认拒绝' : '确认移除'; danger = true; }
  if (command === 'event-finish') {
    const approved = i.applications.filter(a => a.status === 'approved').length;
    title = '确认活动已经结束？'; copy = `仅结算已通过且未被移除的 ${approved} 份报名。`; submit = '结束并结算';
    summary = `<div class="confirm-row"><span>收款方</span><strong>青禾社区资金池</strong></div><div class="confirm-row"><span>报名费合计</span><strong>${approved * i.fee} 稻米</strong></div>`;
  }
  if (command === 'event-cancel') { const count = i.applications.filter(a => ['pending', 'approved'].includes(a.status)).length; title = '取消这场活动？'; copy = `所有申请都会关闭，${count * i.fee} 稻米会退回各申请人的可用余额。`; submit = '确认取消活动'; danger = true; }
  actionForm(title, `<p class="muted">${copy}</p>${summary ? `<div class="confirm-summary">${summary}</div>` : ''}<p class="caption">${task ? '任务' : '活动'}：${esc(i.title)}</p>`, command, { id, candidate: candidate || '' }, submit, '', danger);
}
function run(command, data = {}, fromForm = false) {
  if (!actor) { requestLogin(); return; }
  try {
    const result = perform(state, actor, command, data); state = result.state;
    if (command === 'publish' || command === 'post-publish') delete composeDrafts[`${actor}:${data.kind}`];
    if (fromForm && command !== 'draft') $('action-dialog').close();
    if (fromForm && command === 'draft') $('action-form').dataset.draftId = result.id;
    render();
    if (result.id && command !== 'draft') openDetail(result.id);
    showToast(result.message);
  } catch (error) {
    if (fromForm) { $('form-error').hidden = false; $('form-error').textContent = error.message; $('form-error').scrollIntoView({ block: 'nearest' }); }
    else showToast(error.message);
  }
}
document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]'); if (!control) return;
  const d = control.dataset;
  if (!actor && ['compose', 'compose-type', 'publish-form', 'apply-form', 'submit-form', 'return-form', 'confirm', 'execute', 'member-review', 'community-apply', 'edit-profile', 'post-like', 'read-notifications', 'notice'].includes(d.action)) { requestLogin(); return; }
  if (d.action === 'login') requestLogin();
  else if (d.action === 'logout') { setActor(''); location.hash = 'me'; }
  else if (d.action === 'edit-profile') editProfile();
  else if (d.action === 'detail') openDetail(d.id);
  else if (d.action === 'community') openDetail(nodeRef(d.id || 'qinghe'));
  else if (d.action === 'node-filter') { nodeListFilter = d.filter; if (currentDetail === 'node-directory') renderDetail(); else render(); }
  else if (d.action === 'my-task-filter') { myTaskFilter = d.filter; myTaskFilters[actor] = d.filter; renderDetail(); }
  else if (['alliance', 'community-identities', 'node-directory', 'wallet', 'my-posts', 'my-tasks', 'my-events', 'post'].includes(d.action)) openDetail(d.action);
  else if (d.action === 'author') openDetail(`author:${d.user}`);
  else if (d.action === 'post-like') run('post-like', { id: d.id });
  else if (d.action === 'search') { searchOrigin = page(); closeDetail(); location.hash = 'search'; }
  else if (d.action === 'search-back') { location.hash = searchOrigin; }
  else if (d.action === 'topic') { searchQuery = d.tag; closeDetail(); location.hash = 'search'; render(); }
  else if (d.action === 'compose') composeForm(admin() && page() === 'tasks' ? 'task' : admin() && page() === 'events' ? 'event' : 'post');
  else if (d.action === 'compose-type') composeForm(d.kind);
  else if (d.action === 'close-detail') backDetail();
  else if (d.action === 'close-action') $('action-dialog').close();
  else if (d.action === 'profile') { closeDetail(); location.hash = 'me'; }
  else if (d.action === 'community-list') openDetail('node-directory');
  else if (d.action === 'browse') { if (d.kind === 'task') taskListFilter = d.nodeId || 'all'; else eventNodeFilter = d.nodeId || 'all'; closeDetail(); location.hash = d.kind === 'event' ? 'events' : 'tasks'; render(); }
  else if (d.action === 'publish-form') publishForm(d.kind, d.id);
  else if (d.action === 'apply-form') {
    const i = itemFor(d.id); const isTask = d.id.startsWith('task');
    actionForm(isTask ? '申请承接任务' : '申请参加活动', `<p class="muted">${esc(i.title)}</p><label>${isTask ? '介绍一下你能怎样完成这件事' : '说说你为什么想参加'}<textarea name="reason" required placeholder="写一句简单的说明就好"></textarea></label>${!isTask && i.fee ? `<div class="confirm-summary"><div class="confirm-row"><span>本次冻结</span><strong>${i.fee} 稻米</strong></div><p class="caption">当前可用 ${state.accounts[actor].balance} 稻米。申请不占名额，通过审批后才确认参加。</p></div>` : ''}`, isTask ? 'task-apply' : 'event-apply', { id: d.id }, !isTask && i.fee ? '冻结并提交申请' : '提交申请');
  } else if (d.action === 'submit-form') actionForm('提交最终成果', `<label>成果内容<textarea name="result" required placeholder="说明完成了什么，可以附上成果链接。"></textarea></label>`, 'task-submit', { id: d.id }, '提交成果');
  else if (d.action === 'return-form') actionForm('退回修改', `<p class="muted">报酬继续冻结。承接者修改后可再次提交。</p><label>需要修改的地方<textarea name="reason" required placeholder="清楚写下需要补充或改进的内容。"></textarea></label>`, 'task-return', { id: d.id }, '确认退回');
  else if (d.action === 'confirm') confirmation(d.command, d.id, d.candidate);
  else if (d.action === 'execute') run(d.command, { id: d.id, candidate: d.candidate });
  else if (d.action === 'member-review') run('community-review', { nodeId: d.nodeId, candidate: d.candidate, approve: d.approve === 'true' });
  else if (d.action === 'community-apply') run(d.action, {nodeId:d.nodeId});
  else if (d.action === 'read-notifications') run(d.action);
  else if (d.action === 'notice') { const n = state.notifications.find(n => n.id === d.id); openDetail(n.ref); }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'login-form') { event.preventDefault(); setActor(new FormData(event.target).get('actor')); return; }
  if (event.target.id === 'comment-form') { event.preventDefault(); const form = event.target; run('post-comment', { id: form.dataset.id, comment: new FormData(form).get('comment') }); return; }
  if (event.target.id !== 'action-form') return;
  event.preventDefault(); const form = event.target;
  if (!$('action-dialog').open || form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';
  const data = { ...form.dataset, ...Object.fromEntries(new FormData(form)) };
  run(event.submitter?.value === 'draft' ? 'draft' : form.dataset.command, data, true);
  form.dataset.submitting = 'false';
});
document.addEventListener('change', event => { if (event.target.id === 'task-community-filter') { taskListFilter = event.target.value; render(); return; } if (!['actor', 'detail-actor'].includes(event.target.id)) return; setActor(event.target.value); });
for (const [name, css] of [['font', '--font'], ['gap', '--gap'], ['height', '--button']]) $('' + name + '-control').addEventListener('input', e => { document.documentElement.style.setProperty(css, `${e.target.value}px`); $(name + '-value').value = `${e.target.value}px`; });
$('clock-start').addEventListener('click', () => {
  try { state = startEvent(state, $('clock-event').value); render(); showToast('已模拟到活动开始时间'); }
  catch (error) { showToast(error.message); }
});
$('width-control').addEventListener('click', () => { const narrow = document.body.classList.toggle('narrow'); const url = new URL(location.href); if (narrow) url.searchParams.set('width', 'narrow'); else url.searchParams.delete('width'); window.history.replaceState(null, '', url); $('width-control').setAttribute('aria-pressed', String(narrow)); $('width-control').textContent = narrow ? '恢复自适应宽度' : '模拟手机宽度'; });
$('reset-demo').addEventListener('click', () => { state = initialState(); taskListFilter = 'all'; nodeListFilter = 'all'; eventNodeFilter = 'all'; Object.keys(myTaskFilters).forEach(k => delete myTaskFilters[k]); Object.keys(composeDrafts).forEach(k => delete composeDrafts[k]); $('action-dialog').close(); closeDetail(); render(); showToast('演示数据已重置'); });
document.addEventListener('input', e => { if (e.target.id === 'global-search') { searchQuery = e.target.value; $('search-results').innerHTML = searchResults(); } });
window.addEventListener('hashchange', () => { closeDetail(); render(); window.scrollTo(0, 0); });
$('detail').addEventListener('close', () => { currentDetail = null; detailStack.length = 0; });
$('detail').addEventListener('cancel', event => { event.preventDefault(); backDetail(); });
$('detail').addEventListener('click', event => {
  if (event.target !== $('detail') || $('action-dialog').open) return;
  const box = $('detail').getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) backDetail();
});
if (state.events.some(event => event.id === preview.get('start'))) state = startEvent(state, preview.get('start'));
$('actor').value = actor;
if (preview.get('width') === 'narrow') { document.body.classList.add('narrow'); $('width-control').textContent = '恢复自适应宽度'; $('width-control').setAttribute('aria-pressed', 'true'); }
render();
if ((preview.get('detail')?.startsWith('author:') && state.profiles[preview.get('detail').slice(7)]) || ['community', 'community-identities', 'alliance', 'node-directory', 'wallet', 'my-tasks', 'my-events', 'post'].includes(preview.get('detail')) || (preview.get('detail')?.startsWith('node:') && nodeFor(preview.get('detail').slice(5))) || itemFor(preview.get('detail'))) openDetail(preview.get('detail'));

if (actor && preview.get('detail') === 'edit-profile') editProfile();
