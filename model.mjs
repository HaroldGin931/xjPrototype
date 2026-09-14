// Local presentation state only. No Rice, PDS, network requests or persistence.
export const names = { admin: '周禾', lin: '林舟', chen: '陈言' };
export function initialState() {
  return {
    seq: 20,
    profiles: {
      admin: { name: names.admin, handle: '@zhouhe.test', bio: '和邻居一起照顾公共空间，记录村里的日常。' },
      lin: { name: names.lin, handle: '@linzhou.test', bio: '喜欢沿溪散步，也爱在公共客厅读书。' },
      chen: { name: names.chen, handle: '@chenyan.test', bio: '喜欢手作和画地图，想认识更多身边的朋友。' }
    },
    posts: [
      { id: 'post-1', user: 'admin', author: '周禾', time: '40 分钟前', title: '今天带志愿者跑通了村里老宅的测绘体验线', text: '18 个人，从早上量到日落。老宅的梁架比图纸上复杂得多，明天补一版剖面。', tag: '驻地日志', likes: 34, likedBy: [], comments: [{user:'chen', text:'辛苦大家！整理好的图纸也想一起看看。', time:'20 分钟前'}, {user:'lin', text:'下次测绘我也想参加。',time:'10 分钟前'}] },
      { id: 'post-2', user: 'chen', author: '陈言', time: '2 小时前', title: '公共客厅的书架，终于整理好了', text: '找到了几本大家一直在问的书，也留出了一层放社区的手作和村史资料。\n\n周末来坐坐，翻翻书，聊聊天。', tag: '社区日常', likes: 12, likedBy: [], comments: [{user:'admin',text:'谢谢，目录也可以放在门口，方便大家找书。',time:'1 小时前'}] },
      { id: 'post-3', user: 'lin', author: '林舟', time: '昨天', title: '沿溪散步，遇见一棵很老的树', text: '从社区门口走到溪流转弯的地方，大约十五分钟。天快黑的时候，水面和树影都很安静。', tag: '村庄散步', likes: 21, likedBy: [], comments: [] }
    ],
    // Opening test grants are included in cumulative receipts, independently of available/frozen funds.
    accounts: { admin: { balance: 1000, frozen: 200, totalEarned: 1200 }, lin: { balance: 180, frozen: 0, totalEarned: 180 }, chen: { balance: 80, frozen: 20, totalEarned: 100 } },
    tasks: [
      { id: 'task-1', nodeId: 'qinghe', title: '为村里的步道画一张导览图', description: '走一遍从公共客厅到溪边的步道，整理适合第一次来访者使用的路线。\n\n请在导览图中标出入口、休息点和容易走错的岔路。', requirement: '提交一张清晰的路线图，以及一段简短的路线说明。', reward: 120, status: 'open', assignee: null, applications: [{ user: 'chen', reason: '我住在附近，熟悉这段步道，也做过社区地图。', status: 'pending' }], submissions: [], history: [{ time: '09:20', text: '周禾发布任务，冻结 120 稻米', receipt: 'DEMO-001' }, { time: '10:05', text: '陈言申请承接任务' }] },
      { id: 'task-2', nodeId: 'qinghe', title: '整理公共客厅的图书目录', description: '为公共客厅现有的图书做一次整理，让大家更容易找到想读的书。', requirement: '提交图书分类目录，并说明摆放位置。', reward: 80, status: 'under_review', assignee: 'lin', applications: [{ user: 'lin', reason: '我可以在周末完成整理。', status: 'appointed' }], submissions: [{ text: '已经整理好 86 本图书，分为自然、手作、儿童、文学四类，并在书架上贴好了分类标签。\n\n目录中包含书名、作者和所在层数。', status: 'submitted', time: '11:30' }], history: [{ time: '昨天', text: '周禾发布任务，冻结 80 稻米', receipt: 'DEMO-002' }, { time: '09:00', text: '周禾选定林舟为承接者' }, { time: '11:30', text: '林舟提交成果，等待验收' }] }
    ],
    events: [
      { id: 'event-1', nodeId: 'qinghe', title: '一起修好公共客厅的旧木凳', description: '带着一双愿意动手的手，来公共客厅一起修一张旧木凳。\n\n我们会学习打磨、加固和上蜡，不需要木工经验。工具和材料由社区准备。', date: '周日 14:00–16:00', location: '青禾公共客厅', fee: 20, capacity: 1, status: 'open', applications: [{ user: 'chen', reason: '想学习简单的家具修复，也愿意帮忙准备场地。', status: 'pending' }], history: [{ time: '09:00', text: '周禾发布活动' }, { time: '10:30', text: '陈言申请参加，冻结 20 稻米', receipt: 'DEMO-003' }] },
      { id: 'event-2', nodeId: 'qinghe', title: '沿着溪流，认识我们的村庄', description: '从社区门口出发，沿着溪流慢慢走一圈。\n\n一起认识村里的老树、田地和公共空间，也认识住在附近的朋友。', date: '周六 08:30–10:00', location: '青禾社区门口集合', fee: 0, capacity: 8, status: 'open', applications: [], history: [{ time: '昨天', text: '周禾发布免费活动' }] }
    ],
    nodes: [
      { id: 'qinghe', name: '青禾社区', description: '一起照顾公共空间，分享手艺，连接日常。', members: { admin: 'member', lin: 'none', chen: 'pending' }, history: [{ time: '10:15', text: '陈言申请加入青禾社区' }] },
      { id: 'pingnan', name: '屏南古村测绘队', handle: '@pingnan.web5.xjdao.xyz', description: '驻地屏南，做古村建筑测绘与档案数字化的在地团队。', members: { admin: 'member', lin: 'member', chen: 'none' }, history: [] },
      { id: 'dev', name: '技术社区', handle: '@dev.web5.xjdao.xyz', description: '围绕开源项目开展技术协作。', members: { admin: 'member', lin: 'none', chen: 'none' }, history: [] }
    ],
    ledger: [
      { id: 'DEMO-001', user: 'admin', kind: '冻结', amount: 120, ref: 'task-1', title: '为村里的步道画一张导览图', time: '09:20' },
      { id: 'DEMO-002', user: 'admin', kind: '冻结', amount: 80, ref: 'task-2', title: '整理公共客厅的图书目录', time: '昨天' },
      { id: 'DEMO-003', user: 'chen', kind: '冻结', amount: 20, ref: 'event-1', title: '一起修好公共客厅的旧木凳', time: '10:30' }
    ],
    notifications: [{ id: 'n1', targets: ['admin'], title: '有一份成果等待验收', body: '林舟提交了「整理公共客厅的图书目录」。', ref: 'task-2', time: '11:30', readBy: [] }, { id: 'n2', targets: ['admin'], title: '陈言申请加入社区', body: '可以在社区详情中查看并处理申请。', ref: 'community', time: '10:15', readBy: [] }]
  };
}
function check(ok, message) { if (!ok) throw new Error(message); }
function time() { return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); }
function amount(value) { const n = Number(value); check(Number.isSafeInteger(n) && n >= 0 && n <= 1000000, '请输入有效的稻米金额。'); return n; }
function text(value, message) { const s = String(value || '').trim(); check(s.length > 0, message); return s; }
function history(item, message, receipt) { item.history.push({ time: time(), text: message, receipt }); }
function note(s, targets, title, body, ref) { s.notifications.unshift({ id: `n${s.seq++}`, targets, title, body, ref, time: time(), readBy: [] }); }
function funds(s, kind, payer, item, value, recipient) {
  if (value === 0) return undefined;
  const a = s.accounts[payer];
  if (kind === '冻结') { check(a.balance >= value, `余额不足，需要 ${value} 稻米，当前可用 ${a.balance} 稻米。`); a.balance -= value; a.frozen += value; }
  else { check(a.frozen >= value, '演示数据不一致，请重置演示。'); a.frozen -= value; if (kind === '解冻') a.balance += value; else { s.accounts[recipient].balance += value; s.accounts[recipient].totalEarned += value; } }
  const id = `DEMO-${String(s.seq++).padStart(3, '0')}`;
  s.ledger.unshift({ id, user: payer, kind, amount: value, ref: item.id, title: item.title, time: time() });
  if (kind === '发放') s.ledger.unshift({ id, user: recipient, kind: '收入', amount: value, ref: item.id, title: item.title, time: time() });
  return id;
}
// Called by the preview clock, not by an organizer approval action.
export function startEvent(current, id) {
  const event = current.events.find(item => item.id === id);
  check(event && event.status !== 'draft', '只能推进已发布活动的开始时间。');
  if (event.status !== 'open') return current;
  const s = structuredClone(current);
  const started = s.events.find(item => item.id === id);
  for (const application of started.applications.filter(item => item.status === 'pending')) {
    const receipt = funds(s, '解冻', application.user, started, started.fee);
    application.status = 'not_selected';
    const result = started.fee ? '未入选，冻结费用已退回' : '未入选';
    history(started, `${s.profiles[application.user].name}的申请${result}`, receipt);
    note(s, [application.user], '活动已开始，本次未入选', `${started.title}，${result}。`, started.id);
  }
  started.status = 'started';
  history(started, '活动已开始，报名已关闭');
  return s;
}
export function perform(current, user, action, data = {}) {
  const s = structuredClone(current);
  check(s.accounts[user], '请选择演示身份。');
  let message = '已更新';
  const task = s.tasks.find(t => t.id === data.id);
  const event = s.events.find(t => t.id === data.id);
  const requireAdmin = () => check(user === 'admin', '只有社区管理员可以进行此操作。');
  if (action === 'publish' || action === 'draft') {
    requireAdmin();
    const isTask = data.kind === 'task';
    const list = isTask ? s.tasks : s.events;
    const existing = list.find(x => x.id === data.draftId);
    check(!existing || existing.status === 'draft', '已发布内容的核心约定不能修改。');
    const item = { ...(existing || {}), nodeId: 'qinghe', id: existing?.id || `${isTask ? 'task' : 'event'}-${s.seq++}`, title: text(data.title, '请填写标题。'), description: text(data.description, '请填写说明。'), status: action === 'draft' ? 'draft' : 'open', applications: [], history: [] };
    if (isTask) Object.assign(item, { reward: amount(data.amount), requirement: data.requirement || '请提交能说明完成情况的成果。', assignee: null, submissions: [] });
    else { const capacity = Number(data.capacity); check(Number.isSafeInteger(capacity) && capacity > 0, '请填写大于 0 的参与名额。'); Object.assign(item, { fee: amount(data.amount), capacity, date: text(data.date, '请填写活动时间。'), location: text(data.location, '请填写活动地点。') }); }
    const receipt = action === 'publish' && isTask ? funds(s, '冻结', 'admin', item, item.reward) : undefined;
    history(item, action === 'publish' ? `周禾发布${isTask ? '任务' : '活动'}${receipt ? `，冻结 ${item.reward} 稻米` : ''}` : '周禾保存草稿', receipt);
    if (existing) list.splice(list.indexOf(existing), 1, item); else list.unshift(item);
    return { state: s, message: action === 'publish' ? '发布成功' : '草稿已保存', id: item.id };
  }
  if (action === 'profile-update') {
    const name = text(data.name, '请填写昵称。');
    const bio = String(data.bio || '').trim();
    check(name.length <= 64 && bio.length <= 512, '昵称最多 64 字，简介最多 512 字。');
    Object.assign(s.profiles[user], { name, bio });
    s.posts.filter(post => post.user === user).forEach(post => { post.author = name; });
    return { state: s, message: '资料已保存至当前演示' };
  }
  if (action === 'post-publish') {
    const post = { id: `post-${s.seq++}`, user, author: s.profiles[user].name, time: '刚刚', title: String(data.title || '').trim(), text: text(data.text, '请写下想分享的内容。'), tag: String(data.tag || '').trim().replace(/^#/, ''), likes: 0, likedBy: [], comments: [] };
    s.posts.unshift(post); return { state: s, message: '帖子已发布到演示广场', id: post.id };
  } else if (action === 'post-like' || action === 'post-comment') {
    const post = s.posts.find(p => p.id === data.id); check(post, '帖子不存在。');
    if (action === 'post-like') { const index = post.likedBy.indexOf(user); if (index === -1) { post.likedBy.push(user); post.likes++; } else { post.likedBy.splice(index, 1); post.likes--; } message = index === -1 ? '已点赞' : '已取消点赞'; }
    else { post.comments.push({ user, text: text(data.comment, '请填写评论。'), time: '刚刚' }); message = '评论已发布'; }
  } else if (action.startsWith('task-')) {
    check(task, '任务不存在。');
    if (action === 'task-apply') {
      check(user !== 'admin', '发布者不能申请自己的任务。'); check(task.status === 'open', '这个任务已停止接受申请。');
      check(!task.applications.some(a => a.user === user), '你已经申请过这个任务。');
      task.applications.push({ user, reason: text(data.reason, '请写一句申请说明。'), status: 'pending' }); history(task, `${names[user]}申请承接任务`); note(s, ['admin'], '收到新的任务申请', `${names[user]}申请承接「${task.title}」。`, task.id); message = '申请已提交，等待发布者选择';
    } else if (action === 'task-appoint') {
      requireAdmin(); check(task.status === 'open', '任务已经选定承接者。'); const a = task.applications.find(a => a.user === data.candidate && a.status === 'pending'); check(a, '这份申请当前不可选择。');
      task.assignee = a.user; task.status = 'in_progress'; task.applications.forEach(x => x.status = x.user === a.user ? 'appointed' : 'not_selected'); history(task, `周禾选定${names[a.user]}为承接者`); task.applications.forEach(x => note(s, [x.user], x.user === a.user ? '你已成为任务承接者' : '这次任务已有其他承接者', task.title, task.id)); message = `已选定${names[a.user]}`;
    } else if (action === 'task-submit') {
      check(task.assignee === user && task.status === 'in_progress', '只有承接者可以在执行中提交成果。'); task.submissions.push({ text: text(data.result, '请填写成果内容。'), status: 'submitted', time: time() }); task.status = 'under_review'; history(task, `${names[user]}提交成果，等待验收`); note(s, ['admin'], '有一份成果等待验收', task.title, task.id); message = '成果已提交';
    } else if (action === 'task-return') {
      requireAdmin(); check(task.status === 'under_review', '任务当前没有待验收成果。'); const reason = text(data.reason, '请说明需要修改的地方。'); Object.assign(task.submissions.at(-1), { status: 'returned', feedback: reason }); task.status = 'in_progress'; history(task, `周禾退回成果：${reason}`); note(s, [task.assignee], '成果需要修改', reason, task.id); message = '已退回修改，报酬继续冻结';
    } else if (action === 'task-approve') {
      requireAdmin(); check(task.status === 'under_review', '任务当前不可重复验收。'); const receipt = funds(s, '发放', 'admin', task, task.reward, task.assignee); task.status = 'completed'; task.submissions.at(-1).status = 'approved'; history(task, `周禾验收通过，向${names[task.assignee]}发放 ${task.reward} 稻米`, receipt); note(s, [task.assignee], '任务已验收，稻米已到账', task.title, task.id); message = '验收通过，已完成发放';
    } else if (action === 'task-cancel') {
      requireAdmin(); check(task.status === 'open' || task.status === 'draft', '选定承接者后暂不支持取消任务。'); const receipt = task.status === 'open' ? funds(s, '解冻', 'admin', task, task.reward) : undefined; task.status = 'cancelled'; task.applications.forEach(a => a.status = 'closed'); history(task, '周禾取消任务，报酬已解冻', receipt); message = '任务已取消';
    } else throw new Error('未知任务动作。');
  } else if (action.startsWith('event-')) {
    check(event && ['open', 'started'].includes(event.status), '活动已结束或取消。');
    if (['event-apply', 'event-approve', 'event-reject'].includes(action)) check(event.status === 'open', '活动已开始，报名审批已结束。');
    if (action === 'event-apply') {
      check(user !== 'admin', '发布者不申请自己的活动。'); check(!event.applications.some(a => a.user === user), '你已经申请过这场活动。');
      const reason = text(data.reason, '请写一句参与说明。'); const receipt = funds(s, '冻结', user, event, event.fee); event.applications.push({ user, reason, status: 'pending' }); history(event, `${names[user]}申请参加${event.fee ? `，冻结 ${event.fee} 稻米` : ''}`, receipt); note(s, ['admin'], '收到新的活动申请', `${names[user]}申请参加「${event.title}」。`, event.id); message = '申请已提交，等待审批';
    } else if (['event-approve', 'event-reject', 'event-remove'].includes(action)) {
      requireAdmin(); const a = event.applications.find(a => a.user === data.candidate); check(a, '申请不存在。');
      if (action === 'event-approve') { check(a.status === 'pending', '只能通过待审批申请。'); check(event.applications.filter(a => a.status === 'approved').length < event.capacity, '已通过人数已达到上限。申请人数不受此限制。'); a.status = 'approved'; history(event, `周禾通过${names[a.user]}的申请`); note(s, [a.user], '活动申请已通过', event.title, event.id); message = '申请已通过'; }
      else { check(a.status === (action === 'event-reject' ? 'pending' : 'approved'), '这份申请当前不可执行此操作。'); const receipt = funds(s, '解冻', a.user, event, event.fee); a.status = action === 'event-reject' ? 'rejected' : 'removed'; history(event, `周禾${action === 'event-reject' ? '拒绝' : '移除'}${names[a.user]}的申请${event.fee ? '，费用已解冻' : ''}`, receipt); note(s, [a.user], action === 'event-reject' ? '本次活动申请未通过' : '活动报名已移除', event.fee ? `${event.title}，${event.fee} 稻米已解冻。` : event.title, event.id); message = event.fee ? '已处理，报名费已解冻' : '已处理'; }
    } else if (action === 'event-finish' || action === 'event-cancel') {
      requireAdmin(); const finish = action === 'event-finish';
      if (finish) check(event.status === 'started', '活动尚未开始，不能确认结束。');
      for (const a of event.applications.filter(a => finish ? a.status === 'approved' : ['pending', 'approved'].includes(a.status))) { const pay = finish; const receipt = funds(s, pay ? '发放' : '解冻', a.user, event, event.fee, 'admin'); a.status = pay ? 'completed' : 'closed'; history(event, `${names[a.user]}的申请${pay ? (event.fee ? '已完成结算' : '已完成') : (event.fee ? '已关闭并退回冻结费用' : '已关闭')}`, receipt); note(s, [a.user], finish ? '活动已结束' : '活动已取消', event.fee ? (pay ? `${event.title}，报名费已结算。` : `${event.title}，申请已关闭，冻结费用已退回。`) : `${event.title}，${pay ? '参与记录已完成' : '申请已关闭'}。`, event.id); }
      event.status = finish ? 'ended' : 'cancelled'; history(event, finish ? '周禾确认活动结束' : '周禾取消活动'); message = finish ? (event.fee ? '活动已结束，结算完成' : '活动已结束') : (event.fee ? '活动已取消，冻结费用已退回' : '活动已取消');
    } else throw new Error('未知活动动作。');
  } else if (action === 'community-apply' || action === 'community-review') {
    const node = s.nodes.find(n => n.id === (data.nodeId || 'qinghe'));
    check(node, '社区不存在。');
    if (action === 'community-apply') {
      check(['none', 'rejected'].includes(node.members[user]), '你已加入或已经提交申请。');
      node.members[user] = 'pending'; node.history.push({ time: time(), text: `${names[user]}申请加入${node.name}` });
      note(s, ['admin'], '收到新的入会申请', `${names[user]}申请加入${node.name}。`, `node:${node.id}`); message = '加入申请已提交';
    } else {
      requireAdmin(); check(node.members[data.candidate] === 'pending', '这份申请已经处理。');
      node.members[data.candidate] = data.approve ? 'member' : 'rejected'; node.history.push({ time: time(), text: `周禾${data.approve ? '通过' : '拒绝'}${names[data.candidate]}的加入申请` });
      note(s, [data.candidate], data.approve ? `你已加入${node.name}` : '社区加入申请未通过', '你仍然可以公开申请社区任务和活动。', `node:${node.id}`); message = data.approve ? '已通过加入申请' : '已拒绝加入申请';
    }
  } else if (action === 'read-notifications') {
    s.notifications.filter(n => n.targets.includes(user)).forEach(n => { if (!n.readBy.includes(user)) n.readBy.push(user); }); message = '通知已全部标为已读';
  } else throw new Error('未知操作。');
  return { state: s, message };
}
