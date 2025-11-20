'use client';

import { useState } from 'react';
import { useTaskManager } from '@/lib/hooks/useTaskManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import taskColors from '@/lib/config/task-colors.json';
import { formatDistanceToNow } from 'date-fns';

export default function TaskManager() {
  const { tasks, addTask, updateTask, completeTask, deleteTask, getTasksByStatus } = useTaskManager();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskColor, setNewTaskColor] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editColor, setEditColor] = useState<string>('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      let dueAt: number | undefined = undefined;
      if (newTaskDate) {
        const [h, m] = (newTaskTime || '00:00').split(':').map(Number);
        const d = new Date(newTaskDate);
        d.setHours(h || 0, m || 0, 0, 0);
        dueAt = d.getTime();
      }
      addTask(newTaskTitle, newTaskDescription || undefined, { dueAt, color: newTaskColor || undefined });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDate('');
      setNewTaskTime('');
      setNewTaskColor('');
      setIsAdding(false);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    if (!completed) {
      completeTask(id);
    } else {
      updateTask(id, { completed: false, completedAt: undefined });
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'active' 
    ? getTasksByStatus(false)
    : getTasksByStatus(true);

  const activeTasks = getTasksByStatus(false);
  const completedTasks = getTasksByStatus(true);

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {activeTasks.length} active / {completedTasks.length} done
            </span>
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "destructive" : "default"}
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'active' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeTasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        {/* Add Task Form */}
        {isAdding && (
          <div className="space-y-2 p-4 border border-border rounded-lg bg-card">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} />
              <Input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              {((taskColors as any).colors as string[]).map((c) => (
                <button key={c} onClick={() => setNewTaskColor(c)} className={`w-5 h-5 rounded-full border ${newTaskColor === c ? 'ring-2 ring-primary' : ''}`} style={{ backgroundColor: c }} aria-label="Color" />
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask} size="sm" className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button 
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setNewTaskDate('');
                  setNewTaskTime('');
                  setNewTaskColor('');
                }} 
                size="sm" 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'active' && 'No active tasks. Add one to get started!'}
              {filter === 'completed' && 'No completed tasks yet.'}
              {filter === 'all' && 'No tasks yet. Create your first task!'}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="space-y-2">
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                          <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                          {((taskColors as any).colors as string[]).map((c) => (
                            <button key={c} onClick={() => setEditColor(c)} className={`w-5 h-5 rounded-full border ${editColor === c ? 'ring-2 ring-primary' : ''}`} style={{ backgroundColor: c }} aria-label="Color" />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            let dueAt: number | undefined = undefined;
                            if (editDate) {
                              const [h, m] = (editTime || '00:00').split(':').map(Number);
                              const d = new Date(editDate);
                              d.setHours(h || 0, m || 0, 0, 0);
                              dueAt = d.getTime();
                            }
                            updateTask(task.id, { title: editTitle, description: editDescription || undefined, dueAt, color: editColor || undefined });
                            setEditingId(null);
                          }}>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4>
                          <div className="flex items-center gap-2">
                            {task.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.color }} />}
                            <Button size="sm" variant="ghost" onClick={() => {
                              setEditingId(task.id);
                              setEditTitle(task.title);
                              setEditDescription(task.description || '');
                              const due = (task as any).dueAt ? new Date((task as any).dueAt) : undefined;
                              setEditDate(due ? due.toISOString().slice(0,10) : '');
                              const hh = due ? String(due.getHours()).padStart(2,'0') : '';
                              const mm = due ? String(due.getMinutes()).padStart(2,'0') : '';
                              setEditTime(due ? `${hh}:${mm}` : '');
                              setEditColor(task.color || '');
                            }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                          </span>
                          {(task as any).dueAt && (
                            <span>
                              Due {new Date((task as any).dueAt).toLocaleString()}
                            </span>
                          )}
                          {task.completedAt && (
                            <span className="text-green-500">
                              Completed {formatDistanceToNow(task.completedAt, { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
