import { useMemo, useState } from "react";
import { currentWeekId, weekRange, isoToSerial, serialToISO } from "../lib/dates.js";
import { stTone, prTone, catTone, catShort, NEXT_STATUS } from "../lib/badges.js";
import { notifyAssignment } from "../lib/notify.js";
import { Btn, Input, Select, Textarea, FieldLabel, Badge, EmptyState, Hint } from "../components/ui.jsx";

export default function Tracker({ project, data, update, showDev, showProg }) {
  const { weeks, tasks } = data;
  const members = project.members || [];
  const [openWeeks, setOpenWeeks] = useState(() => new Set(data.openWeeks || [currentWeekId(weeks), "wk1", "wk2", "wk3"]));
  const [editingWeekId, setEditingWeekId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [fCat, setFCat] = useState(""); const [fStatus, setFStatus] = useState(""); const [fWho, setFWho] = useState(""); const [q, setQ] = useState("");
  const [addWeek, setAddWeek] = useState(currentWeekId(weeks));
  const [addForm, setAddForm] = useState({ name: "", cat: "Function Task", priority: "Medium", whoUid: "", desc: "" });

  const filtering = fCat || fStatus || fWho || q;
  const nowId = currentWeekId(weeks);

  function memberByUid(uid) { return members.find(m => m.uid === uid); }

  function notifyIfAssigned(task, weekId) {
    if (!task.whoUid) return;
    const m = memberByUid(task.whoUid);
    if (!m) return;
    const week = weeks.find(w => w.id === weekId);
    notifyAssignment({ toUid: m.uid, projectId: project.id, projectName: project.name, taskName: task.name, weekLabel: week ? week.label : "" });
  }

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
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, status: NEXT_STATUS[t.status] } : t) }));
  }
  function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    update(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== taskId) }));
  }
  function saveTaskEdit(taskId, form) {
    const m = memberByUid(form.whoUid);
    const prevTask = tasks.find(t => t.id === taskId);
    const patch = { name: form.name, desc: form.desc, cat: form.cat, priority: form.priority, status: form.status, week: form.week, whoUid: form.whoUid, who: m ? m.name : "", whoEmail: m ? m.email : "" };
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) }));
    if (form.whoUid && form.whoUid !== prevTask?.whoUid) notifyIfAssigned(patch, form.week);
    setEditingTaskId(null);
  }
  function submitAdd(e) {
    e.preventDefault();
    const name = addForm.name.trim(); if (!name) return;
    const m = memberByUid(addForm.whoUid);
    const task = { id: "t" + Date.now(), week: addWeek, cat: addForm.cat, priority: addForm.priority, whoUid: addForm.whoUid, who: m ? m.name : "", whoEmail: m ? m.email : "", name, desc: addForm.desc.trim(), status: "Not Started" };
    update(d => ({ ...d, tasks: [...d.tasks, task] }));
    notifyIfAssigned(task, addWeek);
    setOpenWeeks(prev => new Set(prev).add(addWeek));
    setAddForm({ name: "", cat: "Function Task", priority: "Medium", whoUid: "", desc: "" });
  }
  function jumpToNow() {
    setOpenWeeks(prev => new Set(prev).add(nowId));
    document.querySelector(`[data-week="${nowId}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--accent)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-5">
        <h2 className="text-sm font-bold text-[var(--accent)] mb-3">＋ Add a task</h2>
        <form onSubmit={submitAdd} className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
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
        </form>
        {members.length === 0 && <p className="text-xs text-[var(--muted)] mt-2">No one is assigned to this project yet — add people to it from Admin Panel → Users to enable task assignment and email notifications.</p>}
      </div>

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
      </div>
      <Hint>Tap a status badge to cycle it. Tap ✎ to rename a week or change its dates.</Hint>

      <div className="space-y-3">
        {weeks.map(w => {
          const all = tasks.filter(t => t.week === w.id);
          const rows = all.filter(t => (!fCat || t.cat === fCat) && (!fStatus || t.status === fStatus) && (!fWho || t.whoUid === fWho) && (!q || (t.name + " " + (t.desc || "")).toLowerCase().includes(q.toLowerCase())));
          if (filtering && !rows.length && !all.length) return null;
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
              showDev={showDev} weeks={weeks} members={members}
              onQuickAdd={() => { setAddWeek(w.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          );
        })}
      </div>
    </div>
  );
}

function WeekBlock({ w, isNow, isOpen, done, all, rows, showProg, showDev, weeks, members, editingWeekId, setEditingWeekId, editingTaskId, setEditingTaskId, onToggleOpen, onSaveWeek, onCycleStatus, onDeleteTask, onSaveTask, onQuickAdd }) {
  const isEditingW = editingWeekId === w.id;
  const [label, setLabel] = useState(w.label);
  const [start, setStart] = useState(serialToISO(w.start));
  const [end, setEnd] = useState(serialToISO(w.end));

  return (
    <div data-week={w.id} className={`bg-[var(--panel)] border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] ${isNow ? "border-2 border-[var(--accent)]" : "border-[var(--line)]"}`}>
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none ${isNow ? "bg-[var(--accent-soft)]" : "bg-[var(--panel-2)]"}`} onClick={onToggleOpen}>
        <span className={`text-[11px] text-[var(--muted)] transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
        <h3 className="text-sm font-bold">{w.label}</h3>
        <span className="text-[11.5px] text-[var(--muted)] flex-1 min-w-0 truncate">{weekRange(w)}</span>
        {isNow && <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOW</span>}
        {showProg && <span className="text-[11.5px] text-[var(--muted)] tabular-nums">{done}/{all.length}</span>}
        <button onClick={e => { e.stopPropagation(); setEditingWeekId(isEditingW ? null : w.id); }} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] text-xs rounded-md px-1.5 py-1">✎</button>
      </div>

      {isEditingW && (
        <div className="bg-[var(--accent-soft)] border-t border-[var(--line)] p-3 flex flex-wrap gap-2 items-end">
          <div><FieldLabel>Label</FieldLabel><Input value={label} onChange={e => setLabel(e.target.value)} className="max-w-[140px]" /></div>
          <div><FieldLabel>Start date</FieldLabel><Input type="date" value={start} onChange={e => setStart(e.target.value)} className="max-w-[150px]" /></div>
          <div><FieldLabel>End date</FieldLabel><Input type="date" value={end} onChange={e => setEnd(e.target.value)} className="max-w-[150px]" /></div>
          <div className="flex gap-1.5">
            <Btn onClick={() => onSaveWeek(label, start, end)}>Save</Btn>
            <Btn variant="secondary" onClick={() => setEditingWeekId(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      {isOpen && (
        <div>
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
                    editing={editingTaskId === t.id}
                    onEdit={() => setEditingTaskId(editingTaskId === t.id ? null : t.id)}
                    onCycleStatus={() => onCycleStatus(t.id)} onDelete={() => onDeleteTask(t.id)}
                    onSave={form => onSaveTask(t.id, form)} onCancel={() => setEditingTaskId(null)} />
                ))}
              </div>
            </>
          )}
          <button onClick={onQuickAdd} className="block w-full text-left text-[var(--green)] font-semibold text-sm px-3.5 py-2.5 hover:bg-[var(--panel-2)]">＋ Add task to {w.label}</button>
        </div>
      )}
    </div>
  );
}

function TaskEditPanel({ t, weeks, members, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({ name: t.name, desc: t.desc || "", cat: t.cat, priority: t.priority, status: t.status, whoUid: t.whoUid || "", week: t.week });
  return (
    <div className="bg-[var(--accent-soft)] p-3 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
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
        <Btn variant="danger" className="ml-auto" onClick={onDelete}>Delete</Btn>
      </div>
    </div>
  );
}

function TaskRow({ t, showDev, weeks, members, editing, onEdit, onCycleStatus, onDelete, onSave, onCancel }) {
  return (
    <>
      <tr className={editing ? "bg-[var(--accent-soft)]" : ""}>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={catTone(t.cat)}>{catShort(t.cat)}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top">
          <div>{t.name}</div>
          {t.desc && <div className="text-[var(--muted)] text-xs mt-0.5">{t.desc}</div>}
        </td>
        {showDev && <td className="px-3 py-2.5 border-t border-[var(--line)] align-top">{t.who || "—"}</td>}
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={stTone(t.status)} onClick={onCycleStatus}>{t.status}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top"><Badge tone={prTone(t.priority)}>{t.priority}</Badge></td>
        <td className="px-3 py-2.5 border-t border-[var(--line)] align-top whitespace-nowrap">
          <button onClick={onEdit} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] rounded-md px-1.5 py-1 text-xs">✎</button>
          <button onClick={onDelete} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2 py-1 text-base leading-none">×</button>
        </td>
      </tr>
      {editing && <tr><td colSpan={showDev ? 6 : 5} className="p-0"><TaskEditPanel t={t} weeks={weeks} members={members} onSave={onSave} onCancel={onCancel} onDelete={onDelete} /></td></tr>}
    </>
  );
}

function TaskCard({ t, showDev, weeks, members, editing, onEdit, onCycleStatus, onDelete, onSave, onCancel }) {
  return (
    <div className="p-3.5">
      <div className="flex gap-1.5 flex-wrap items-center mb-1.5">
        <Badge tone={catTone(t.cat)}>{catShort(t.cat)}</Badge>
        <Badge tone={prTone(t.priority)}>{t.priority}</Badge>
        {showDev && t.who && <span className="text-[11.5px] text-[var(--muted)]">· {t.who}</span>}
      </div>
      <div className="text-[13.5px] font-medium mb-0.5">{t.name}</div>
      {t.desc && <div className="text-xs text-[var(--muted)] mb-2">{t.desc}</div>}
      <div className="flex gap-1.5 flex-wrap items-center">
        <Badge tone={stTone(t.status)} onClick={onCycleStatus}>{t.status}</Badge>
        <div className="ml-auto flex gap-1 items-center">
          <button onClick={onEdit} className="text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)] rounded-md px-2 py-1.5 text-xs font-semibold">✎</button>
          <button onClick={onDelete} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2 py-1.5 text-base leading-none">×</button>
        </div>
      </div>
      {editing && <div className="mt-3"><TaskEditPanel t={t} weeks={weeks} members={members} onSave={onSave} onCancel={onCancel} onDelete={onDelete} /></div>}
    </div>
  );
}
