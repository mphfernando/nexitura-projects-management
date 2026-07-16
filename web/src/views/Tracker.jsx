import { useEffect, useState } from "react";
import { currentWeekId, weekRange, isoToSerial, serialToISO } from "../lib/dates.js";
import { stTone, prTone, catTone, catShort, NEXT_STATUS, prBorderColor } from "../lib/badges.js";
import { notifyAssignment } from "../lib/notify.js";
import { logActivity } from "../lib/activity.js";
import { useAppState } from "../hooks/useAppState.jsx";
import { Btn, Input, Select, Textarea, FieldLabel, Badge, EmptyState, Hint } from "../components/ui.jsx";

export default function Tracker({ project, data, update, showDev, showProg, canAdd, canEditTask, canDeleteTask, canEditWeek, focusTaskId, focusWeekId, focusNonce }) {
  const { profile } = useAppState();
  const { weeks, tasks } = data;
  const members = project.members || [];
  const [openWeeks, setOpenWeeks] = useState(() => new Set(data.openWeeks || [currentWeekId(weeks), "wk1", "wk2", "wk3"]));
  const [editingWeekId, setEditingWeekId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [fCat, setFCat] = useState(""); const [fStatus, setFStatus] = useState(""); const [fWho, setFWho] = useState(""); const [q, setQ] = useState("");
  const [showEmpty, setShowEmpty] = useState(false);
  const [addWeek, setAddWeek] = useState(currentWeekId(weeks));
  const [addForm, setAddForm] = useState({ name: "", cat: "Function Task", priority: "Medium", whoUid: "", desc: "" });
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const filtering = fCat || fStatus || fWho || q;
  const nowId = currentWeekId(weeks);

  function memberByUid(uid) { return members.find(m => m.uid === uid); }
  const log = (action, detail) => logActivity(project.id, profile, action, detail);

  function notifyIfAssigned(task, weekId) {
    if (!task.whoUid) return;
    const m = memberByUid(task.whoUid);
    if (!m) return;
    const week = weeks.find(w => w.id === weekId);
    notifyAssignment({ toUid: m.uid, projectId: project.id, projectName: project.name, taskName: task.name, taskId: task.id, weekId, weekLabel: week ? week.label : "" });
  }

  // Jumping here from a notification: open the task's week, scroll to it,
  // and give it a brief highlight flash so it's obvious what you were sent to see.
  useEffect(() => {
    const wantedWeek = focusWeekId || (focusTaskId ? tasks.find(t => t.id === focusTaskId)?.week : null);
    if (!wantedWeek) return;
    setOpenWeeks(prev => new Set(prev).add(wantedWeek));
    const t = setTimeout(() => {
      const selector = focusTaskId ? `[data-task="${focusTaskId}"]` : `[data-week="${wantedWeek}"]`;
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("flash-highlight");
        setTimeout(() => el.classList.remove("flash-highlight"), 2000);
      }
    }, 350); // let the week's collapse animation open first
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);

  function toggleWeekOpen(id) {
    setOpenWeeks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      update(d => ({ ...d, openWeeks: [...next] }));
      return next;
    });
  }
  function saveWeekEdit(id, label, start, end) {
    update(d => ({ ...d, weeks: d.weeks.map(w => w.id === id ? { ...w, label: label || w.label, ...(start ? { start: isoToSerial(start) } : {}), ...(end ? { end: isoToSerial(end) } : {}) } : w) }));
    setEditingWeekId(null);
  }
  function cycleStatus(taskId) {
    const t = tasks.find(x => x.id === taskId);
    const next = NEXT_STATUS[t.status];
    update(d => ({ ...d, tasks: d.tasks.map(x => x.id === taskId ? { ...x, status: next } : x) }));
    log("task status changed", `"${t.name}" → ${next}`);
  }
  function deleteTask(taskId) {
    const t = tasks.find(x => x.id === taskId);
    if (!confirm("Delete this task?")) return;
    update(d => ({ ...d, tasks: d.tasks.filter(x => x.id !== taskId) }));
    log("task deleted", t?.name);
  }
  function saveTaskEdit(taskId, form) {
    const m = memberByUid(form.whoUid);
    const prevTask = tasks.find(t => t.id === taskId);
    const patch = { name: form.name, desc: form.desc, cat: form.cat, priority: form.priority, status: form.status, week: form.week, whoUid: form.whoUid, who: m ? m.name : "", whoEmail: m ? m.email : "" };
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) }));
    if (form.whoUid && form.whoUid !== prevTask?.whoUid) notifyIfAssigned({ ...patch, id: taskId }, form.week);
    log("task edited", patch.name);
    setEditingTaskId(null);
  }
  function addTask(weekId) {
    const name = addForm.name.trim(); if (!name) return;
    const m = memberByUid(addForm.whoUid);
    const task = { id: "t" + Date.now(), week: weekId, cat: addForm.cat, priority: addForm.priority, whoUid: addForm.whoUid, who: m ? m.name : "", whoEmail: m ? m.email : "", name, desc: addForm.desc.trim(), status: "Not Started" };
    update(d => ({ ...d, tasks: [...d.tasks, task] }));
    notifyIfAssigned(task, weekId);
    log("task added", name);
    setOpenWeeks(prev => new Set(prev).add(weekId));
    setAddForm({ name: "", cat: "Function Task", priority: "Medium", whoUid: "", desc: "" });
  }
  function submitAdd(e) { e.preventDefault(); addTask(addWeek); setMobileSheetOpen(false); }
  function jumpToNow() {
    setOpenWeeks(prev => new Set(prev).add(nowId));
    document.querySelector(`[data-week="${nowId}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const addFormFields = (
    <>
      <div className="sm:col-span-2">
        <FieldLabel>Task name</FieldLabel>
        <Input required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fix seller login redirect" />
      </div>
      <div>
        <FieldLabel>Week</FieldLabel>
        <Select value={addWeek} onChange={e => setAddWeek(e.target.value)}>
          {weeks.map(w => <option key={w.id} value={w.id}>{w.label} · {weekRange(w)}</option>)}
        </Select>
      </div>
      <div>
        <FieldLabel>Type</FieldLabel>
        <Select value={addForm.cat} onChange={e => setAddForm(f => ({ ...f, cat: e.target.value }))}>
          <option>Function Task</option><option>UI Issue</option><option>Bug</option>
        </Select>
      </div>
      <div>
        <FieldLabel>Priority</FieldLabel>
        <Select value={addForm.priority} onChange={e => setAddForm(f => ({ ...f, priority: e.target.value }))}>
          <option>High</option><option>Medium</option><option>Low</option>
        </Select>
      </div>
      <div>
        <FieldLabel>Assigned to</FieldLabel>
        <Select value={addForm.whoUid} onChange={e => setAddForm(f => ({ ...f, whoUid: e.target.value }))}>
          <option value="">Unassigned</option>
          {members.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
        </Select>
      </div>
      <div className="col-span-full">
        <FieldLabel>Description (optional)</FieldLabel>
        <Textarea rows={1} value={addForm.desc} onChange={e => setAddForm(f => ({ ...f, desc: e.target.value }))} placeholder="Any extra detail…" />
      </div>
      <div className="col-span-full"><Btn type="submit">Add task</Btn></div>
    </>
  );

  return (
    <div>
      {canAdd && (
        <>
          {/* Desktop add-task card */}
          <div className="hidden md:block bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--accent)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-5">
            <h2 className="text-sm font-bold text-[var(--accent)] mb-3">＋ Add a task</h2>
            <form onSubmit={submitAdd} className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
              {addFormFields}
            </form>
            {members.length === 0 && <p className="text-xs text-[var(--muted)] mt-2">No one is assigned to this project yet — add people to it from Admin Panel → Users to enable task assignment and notifications.</p>}
          </div>

          {/* Mobile floating add button + slide-up sheet */}
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[var(--accent)] text-white text-2xl font-bold shadow-[var(--shadow-md)] flex items-center justify-center"
            aria-label="Add task"
          >＋</button>
          {mobileSheetOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex items-end">
              <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSheetOpen(false)} />
              <div className="anim-sheet-up relative w-full bg-[var(--panel)] rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
                <div className="w-10 h-1 bg-[var(--line)] rounded-full mx-auto mb-3" />
                <h2 className="text-sm font-bold text-[var(--accent)] mb-3">＋ Add a task</h2>
                <form onSubmit={submitAdd} className="grid grid-cols-2 gap-2.5">
                  {addFormFields}
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2 items-center mb-3.5">
        <Select className="!w-auto flex-1 min-w-[100px]" value={fCat} onChange={e => setFCat(e.target.value)}>
          <option value="">All types</option><option>Function Task</option><option>UI Issue</option><option>Bug</option>
        </Select>
        <Select className="!w-auto flex-1 min-w-[100px]" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">All statuses</option><option>Not Started</option><option>In Progress</option><option>Completed</option>
        </Select>
        <Select className="!w-auto flex-1 min-w-[100px]" value={fWho} onChange={e => setFWho(e.target.value)}>
          <option value="">Everyone</option>{members.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
        </Select>
        <Input className="flex-[2] min-w-[80px]" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        <Btn variant="secondary" onClick={jumpToNow}>This week</Btn>
        <label className="inline-flex items-center gap-1.5 text-xs bg-[var(--grey-soft)] px-2.5 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} />
          Show empty weeks
        </label>
      </div>
      <Hint>Tap a status badge to cycle it. Tap ✎ to rename a week or change its dates.</Hint>

      <div className="space-y-3">
        {weeks.map(w => {
          const all = tasks.filter(t => t.week === w.id);
          const rows = all.filter(t => (!fCat || t.cat === fCat) && (!fStatus || t.status === fStatus) && (!fWho || t.whoUid === fWho) && (!q || (t.name + " " + (t.desc || "")).toLowerCase().includes(q.toLowerCase())));
          if (filtering && !rows.length && !all.length) return null;
          if (!filtering && !showEmpty && all.length === 0) return null;
          const done = all.filter(t => t.status === "Completed").length;
          const isNow = w.id === nowId;
          const isOpen = filtering ? rows.length > 0 : openWeeks.has(w.id);
          return (
            <WeekBlock
              key={w.id} w={w} isNow={isNow} isOpen={isOpen} done={done} all={all} rows={rows} showProg={showProg}
              editingWeekId={editingWeekId} setEditingWeekId={setEditingWeekId}
              editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId}
              onToggleOpen={() => toggleWeekOpen(w.id)}
              onSaveWeek={(label, start, end) => saveWeekEdit(w.id, label, start, end)}
              onCycleStatus={cycleStatus} onDeleteTask={deleteTask} onSaveTask={saveTaskEdit}
              showDev={showDev} weeks={weeks} members={members} canAdd={canAdd}
              canEditTask={canEditTask} canDeleteTask={canDeleteTask} canEditWeek={canEditWeek}
              onQuickAdd={() => { setAddWeek(w.id); setMobileSheetOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          );
        })}
      </div>
    </div>
  );
}

function WeekBlock({ w, isNow, isOpen, done, all, rows, showProg, showDev, weeks, members, canAdd, canEditTask, canDeleteTask, canEditWeek, editingWeekId, setEditingWeekId, editingTaskId, setEditingTaskId, onToggleOpen, onSaveWeek, onCycleStatus, onDeleteTask, onSaveTask, onQuickAdd }) {
  const isEditingW = editingWeekId === w.id;
  const [label, setLabel] = useState(w.label);
  const [start, setStart] = useState(serialToISO(w.start));
  const [end, setEnd] = useState(serialToISO(w.end));
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  return (
    <div data-week={w.id} className={`bg-[var(--panel)] border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] ${isNow ? "border-2 border-[var(--accent)]" : "border-[var(--line)]"}`}>
      <div className={`relative flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none ${isNow ? "bg-[var(--accent-soft)]" : "bg-[var(--panel-2)]"}`} onClick={onToggleOpen}>
        <span className={`text-[11px] text-[var(--muted)] transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
        <h3 className="text-sm font-bold">{w.label}</h3>
        <span className="text-[11.5px] text-[var(--muted)] flex-1 min-w-0 truncate">{weekRange(w)}</span>
        {isNow && <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOW</span>}
        {showProg && <span className="text-[11.5px] text-[var(--muted)] tabular-nums">{done}/{all.length}</span>}
        {canEditWeek && <button onClick={e => { e.stopPropagation(); setEditingWeekId(isEditingW ? null : w.id); }} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] text-xs rounded-md px-1.5 py-1">✎</button>}
        {showProg && all.length > 0 && (
          <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[var(--line)]">
            <div className="h-full bg-[var(--green)] transition-all" style={{ width: pct + "%" }} />
          </div>
        )}
      </div>

      {isEditingW && (
        <div className="anim-slide-down bg-[var(--accent-soft)] border-t border-[var(--line)] p-3 flex flex-wrap gap-2 items-end">
          <div><FieldLabel>Label</FieldLabel><Input value={label} onChange={e => setLabel(e.target.value)} className="max-w-[140px]" /></div>
          <div><FieldLabel>Start date</FieldLabel><Input type="date" value={start} onChange={e => setStart(e.target.value)} className="max-w-[150px]" /></div>
          <div><FieldLabel>End date</FieldLabel><Input type="date" value={end} onChange={e => setEnd(e.target.value)} className="max-w-[150px]" /></div>
          <div className="flex gap-1.5">
            <Btn onClick={() => onSaveWeek(label, start, end)}>Save</Btn>
            <Btn variant="secondary" onClick={() => setEditingWeekId(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div className={`collapse-rows ${isOpen ? "open" : ""}`}>
        <div className="collapse-inner">
          {!rows.length ? (
            <EmptyState>{all.length ? "No tasks match filters." : "No tasks yet."}</EmptyState>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[var(--panel-2)] text-[10.5px] uppercase tracking-wide text-[var(--muted)]">
                      <th className="text-left px-3 py-2 border-t border-[var(--line)] w-24">Type</th>
                      <th className="text-left px-3 py-2 border-t border-[var(--line)]">Task</th>
                      {showDev && <th className="text-left px-3 py-2 border-t border-[var(--line)] w-24">Assigned</th>}
                      <th className="text-left px-3 py-2 border-t border-[var(--line)] w-28">Status</th>
                      <th className="text-left px-3 py-2 border-t border-[var(--line)] w-20">Priority</th>
                      <th className="border-t border-[var(--line)] w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(t => (
                      <TaskRow key={t.id} t={t} showDev={showDev} weeks={weeks} members={members}
                        canEditTask={canEditTask} canDeleteTask={canDeleteTask}
                        editing={editingTaskId === t.id}
                        onEdit={() => setEditingTaskId(editingTaskId === t.id ? null : t.id)}
                        onCycleStatus={() => onCycleStatus(t.id)} onDelete={() => onDeleteTask(t.id)}
                        onSave={form => onSaveTask(t.id, form)} onCancel={() => setEditingTaskId(null)} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-[var(--line)]">
                {rows.map(t => (
                  <TaskCard key={t.id} t={t} showDev={showDev} weeks={weeks} members={members}
                    canEditTask={canEditTask} canDeleteTask={canDeleteTask}
                    editing={editingTaskId === t.id}
                    onEdit={() => setEditingTaskId(editingTaskId === t.id ? null : t.id)}
                    onCycleStatus={() => onCycleStatus(t.id)} onDelete={() => onDeleteTask(t.id)}
                    onSave={form => onSaveTask(t.id, form)} onCancel={() => setEditingTaskId(null)} />
                ))}
              </div>
            </>
          )}
          {canAdd && <button onClick={onQuickAdd} className="block w-full text-left text-[var(--green)] font-semibold text-sm px-3.5 py-2.5 hover:bg-[var(--panel-2)]">＋ Add task to {w.label}</button>}
        </div>
      </div>
    </div>
  );
}

function TaskEditPanel({ t, weeks, members, onSave, onCancel, onDelete, canDeleteTask }) {
  const [f, setF] = useState({ name: t.name, desc: t.desc || "", cat: t.cat, priority: t.priority, status: t.status, whoUid: t.whoUid || "", week: t.week });
  return (
    <div className="anim-slide-down bg-[var(--accent-soft)] p-3 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
      <div className="col-span-full"><FieldLabel>Task name</FieldLabel><Input value={f.name} onChange={e => setF(v => ({ ...v, name: e.target.value }))} /></div>
      <div className="col-span-full"><FieldLabel>Description</FieldLabel><Textarea rows={2} value={f.desc} onChange={e => setF(v => ({ ...v, desc: e.target.value }))} /></div>
      <div><FieldLabel>Type</FieldLabel><Select value={f.cat} onChange={e => setF(v => ({ ...v, cat: e.target.value }))}><option>Function Task</option><option>UI Issue</option><option>Bug</option></Select></div>
      <div><FieldLabel>Priority</FieldLabel><Select value={f.priority} onChange={e => setF(v => ({ ...v, priority: e.target.value }))}><option>High</option><option>Medium</option><option>Low</option></Select></div>
      <div><FieldLabel>Status</FieldLabel><Select value={f.status} onChange={e => setF(v => ({ ...v, status: e.target.value }))}><option>Not Started</option><option>In Progress</option><option>Completed</option></Select></div>
      <div><FieldLabel>Assigned to</FieldLabel>
        <Select value={f.whoUid} onChange={e => setF(v => ({ ...v, whoUid: e.target.value }))}>
          <option value="">Unassigned</option>
          {members.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
        </Select>
      </div>
      <div><FieldLabel>Week</FieldLabel><Select value={f.week} onChange={e => setF(v => ({ ...v, week: e.target.value }))}>{weeks.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}</Select></div>
      <div className="col-span-full flex gap-1.5">
        <Btn onClick={() => onSave(f)}>Save</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        {canDeleteTask && <Btn variant="danger" className="ml-auto" onClick={onDelete}>Delete</Btn>}
      </div>
    </div>
  );
}

function TaskRow({ t, showDev, weeks, members, editing, onEdit, onCycleStatus, onDelete, onSave, onCancel, canEditTask, canDeleteTask }) {
  const done = t.status === "Completed";
  return (
    <>
      <tr data-task={t.id} className={`${editing ? "bg-[var(--accent-soft)]" : ""} ${done ? "opacity-60" : ""}`} style={{ boxShadow: `inset 3px 0 0 0 ${prBorderColor(t.priority)}` }}>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={catTone(t.cat)}>{catShort(t.cat)}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top">
          <div>{t.name}</div>
          {t.desc && <div className="text-[var(--muted)] text-xs mt-0.5">{t.desc}</div>}
        </td>
        {showDev && <td className="px-3 py-2.5 border-t border-[var(--line)] align-top">{t.who || "—"}</td>}
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={stTone(t.status)} onClick={canEditTask ? onCycleStatus : undefined}>{t.status}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={prTone(t.priority)}>{t.priority}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top whitespace-nowrap">
          {canEditTask && <button onClick={onEdit} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] rounded-md px-1.5 py-1 text-xs">✎</button>}
          {canDeleteTask && <button onClick={onDelete} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2 py-1 text-base leading-none">×</button>}
        </td>
      </tr>
      {editing && <tr><td colSpan={showDev ? 6 : 5} className="p-0"><TaskEditPanel t={t} weeks={weeks} members={members} onSave={onSave} onCancel={onCancel} onDelete={onDelete} canDeleteTask={canDeleteTask} /></td></tr>}
    </>
  );
}

function TaskCard({ t, showDev, weeks, members, editing, onEdit, onCycleStatus, onDelete, onSave, onCancel, canEditTask, canDeleteTask }) {
  const done = t.status === "Completed";
  return (
    <div data-task={t.id} className={`p-3.5 ${done ? "opacity-60" : ""}`} style={{ boxShadow: `inset 3px 0 0 0 ${prBorderColor(t.priority)}` }}>
      <div className="flex gap-1.5 flex-wrap items-center mb-1.5">
        <Badge tone={catTone(t.cat)}>{catShort(t.cat)}</Badge>
        <Badge tone={prTone(t.priority)}>{t.priority}</Badge>
        {showDev && t.who && <span className="text-[11.5px] text-[var(--muted)]">· {t.who}</span>}
      </div>
      <div className="text-[13.5px] font-medium mb-0.5">{t.name}</div>
      {t.desc && <div className="text-xs text-[var(--muted)] mb-2">{t.desc}</div>}
      <div className="flex gap-1.5 flex-wrap items-center">
        <Badge tone={stTone(t.status)} onClick={canEditTask ? onCycleStatus : undefined} className="!px-3.5 !py-2 text-[12px]">{t.status}</Badge>
        <div className="ml-auto flex gap-1 items-center">
          {canEditTask && <button onClick={onEdit} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] rounded-md px-2.5 py-2 text-sm font-semibold">✎</button>}
          {canDeleteTask && <button onClick={onDelete} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2.5 py-2 text-lg leading-none">×</button>}
        </div>
      </div>
      {editing && <div className="mt-3"><TaskEditPanel t={t} weeks={weeks} members={members} onSave={onSave} onCancel={onCancel} onDelete={onDelete} canDeleteTask={canDeleteTask} /></div>}
    </div>
  );
}
